import { app, BrowserWindow, nativeTheme } from "electron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import pkg from "electron-updater";
const { autoUpdater } = pkg;

import { dialog } from "electron";

let springBootProcess;
let mainWindow;
let isSpringReady = false;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

const SPRING_PORT = 8080;
const START_URL = `http://localhost:${SPRING_PORT}`;

// 1. Tema Ayarını En Üstte Yapın
nativeTheme.themeSource = "dark";

const getAssetPath = (assetName) => {
  return app.isPackaged
    ? path.join(process.resourcesPath, assetName)
    : path.join(app.getAppPath(), assetName);
};

function createWindow() {
  mainWindow = new BrowserWindow({
    backgroundColor: "#030712",
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(START_URL);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Hata durumunda yeniden deneme (Backend geç kalırsa)
  mainWindow.webContents.on("did-fail-load", () => {
    setTimeout(() => mainWindow.loadURL(START_URL), 2000);
  });

  mainWindow.on("unresponsive", () => {
    console.log("Uygulama yanıt vermiyor, yeniden yükleniyor...");
    mainWindow.reload();
  });
}

// 3. Güncelleme Kontrolü (Global Scope)
function checkUpdates() {
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

autoUpdater.on("checking-for-update", () => {
  console.log("Güncelleme kontrol ediliyor...");
});

autoUpdater.on("update-available", (info) => {
  dialog.showMessageBox({
    type: "info",
    title: "Güncelleme Bulundu",
    message: `Yeni versiyon (${info.version}) bulundu. İndiriliyor...`,
  });
});

autoUpdater.on("update-not-available", () => {
  console.log("Güncelleme yok.");
});

autoUpdater.on("error", (err) => {
  dialog.showErrorBox("Güncelleme Hatası", err.message);
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(
    `İndirme hızı: ${progressObj.bytesPerSecond} - Başarı: %${progressObj.percent}`,
  );
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      title: "Güncelleme Hazır",
      message: "Güncelleme indirildi. Uygulama şimdi kapanıp güncellenecek.",
    })
    .then(() => {
      killSpring(); // Spring Boot sürecini kapatmak çok önemli!
      setImmediate(() => autoUpdater.quitAndInstall());
    });
});
// 4. Backend Başlatma
function startBackend() {
  const jarPath = getAssetPath("backend.jar");

  if (!fs.existsSync(jarPath)) {
    dialog.showErrorBox("Hata", "JAR dosyası bulunamadı: " + jarPath);
    return;
  }

  springBootProcess = spawn("java", ["-jar", jarPath], {
    cwd: app.isPackaged ? process.resourcesPath : app.getAppPath(),
    shell: true,
  });

  springBootProcess.on("error", (err) => {
    dialog.showErrorBox(
      "Java Başlatma Hatası",
      "Bilgisayarınızda Java kurulu olmayabilir veya yol hatalıdır.\n Hata: " +
        err.message,
    );
  });

  setTimeout(() => {
    if (!isSpringReady) {
      dialog.showMessageBox({
        type: "warning",
        title: "Zaman Aşımı",
        message:
          "Backend başlatılamadı. Lütfen java'nın kurulu olduğundan ve 8080 portunun boş olduğundan emin olun.",
      });
    }
  }, 30000);

  springBootProcess.stdout.on("data", (data) => {
    const dataString = data.toString();
    console.log(`[Spring Boot]: ${dataString.trim()}`);

    if (
      !isSpringReady &&
      (dataString.includes("Tomcat started on port") ||
        dataString.includes("Started LogoApplication"))
    ) {
      isSpringReady = true;
      createWindow();
    }
  });

  springBootProcess.stderr.on("data", (data) => {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "spring-error.log"),
      data.toString(),
    );
  });
}

// 5. Uygulama Yaşam Döngüsü (Tek bir whenReady yeterli)
app.whenReady().then(() => {
  startBackend();
  checkUpdates();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && isSpringReady) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function killSpring() {
  if (!springBootProcess) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/PID", springBootProcess.pid, "/T", "/F"], {
      shell: true,
    });
  } else {
    try {
      process.kill(-springBootProcess.pid);
    } catch (e) {
      springBootProcess.kill("SIGKILL");
    }
  }
}

app.on("before-quit", () => {
  killSpring();
});
