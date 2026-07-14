import { app, BrowserWindow, nativeTheme, shell } from "electron";
import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";
import pkg from "electron-updater";
const { autoUpdater } = pkg;
import http from "http";
import { dialog } from "electron";
import dotenv from "dotenv";

let springBootProcess;
let mainWindow;
let isSpringReady = false;

const getAssetPath = (assetName) => {
  return app.isPackaged
    ? path.join(process.resourcesPath, assetName)
    : path.join(process.cwd(), assetName);
};

dotenv.config({ path: getAssetPath(".env") });

const START_URL = process.env.START_URL;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

nativeTheme.themeSource = "dark";

function createWindow() {
  mainWindow = new BrowserWindow({
    backgroundColor: "#030712",
    show: false,
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false,
    },
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(START_URL)) {
      event.preventDefault();
      console.warn(`Güvensiz Yönlendirme Engellendi: ${url}`);
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("action=print") || url === "about:blank") {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          backgroundColor: "#ffffff",
        },
      };
    }

    console.warn(`Güvensiz harici link dış tarayıcıya yönlendirildi: ${url}`);
    if (url.startsWith("http")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-fail-load", () => {
    console.log("Backend hazır değil, 2 saniye içinde tekrar denenecek...");
    setTimeout(() => {
      if (mainWindow) mainWindow.loadURL(START_URL);
    }, 2000);
  });

  mainWindow.loadURL(START_URL);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show(); // Sadece içerik gerçekten yüklendiğinde pencereyi aç
  });

  mainWindow.on("unresponsive", () => {
    console.log("Uygulama yanıt vermiyor, yeniden yükleniyor...");
    mainWindow.reload();
  });

  mainWindow.webContents.on("render-process-gone", (_, details) => {
    dialog.showMessageBox({
      type: "error",
      title: "Uygulama Hatası",
      message: `Uygulama beklenmedik şekilde kapandı (${details.reason}). Yeniden başlatılıyor.`,
    });
    mainWindow.reload();
  });

  mainWindow.webContents.on("crashed", () => {
    dialog.showErrorBox("Çökme", "Uygulama çöktü. Yeniden yükleniyor.");
    mainWindow.reload();
  });
}

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
      killSpring();
      setImmediate(() => autoUpdater.quitAndInstall());
    });
});

function startBackend() {
  const jarPath = getAssetPath("backend.jar");

  if (!fs.existsSync(jarPath)) {
    dialog.showErrorBox("Hata", "JAR dosyası bulunamadı: " + jarPath);
    return;
  }

  springBootProcess = spawn(
    "java",
    ["-jar", jarPath, "--server.address=127.0.0.1"],
    {
      cwd: app.isPackaged ? process.resourcesPath : app.getAppPath(),
      stdio: "pipe",
    },
  );

  springBootProcess.on("error", (err) => {
    dialog.showMessageBoxSync({
      type: "error",
      title: "Java Başlatma Hatası",
      message:
        "Bilgisayarınızda Java kurulu olmayabilir veya yol hatalıdır.\n\nLütfen Java'nın kurulu olduğundan emin olup uygulamayı tekrar başlatın.\nHata: " +
        err.message,
      buttons: ["Tamam"],
    });
    killSpring();
    app.exit(0);
  });

  setTimeout(() => {
    if (!isSpringReady) {
      dialog.showMessageBoxSync({
        type: "error",
        title: "Sistem Başlatılamadı",
        message:
          "Uygulama sunucusu (Backend) zaman aşımına uğradı ve başlatılamadı.\n\nLütfen bilgisayarınızda Java'nın kurulu olduğundan emin olun ve uygulamayı yeniden çalıştırın.",
        buttons: ["Tamam"],
      });

      console.log("Zaman aşımı nedeniyle uygulama kapatılıyor...");
      killSpring();
      app.exit(0);
    }
  }, 30000);

  springBootProcess.stderr.on("data", (data) => {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "spring-error.log"),
      data.toString(),
    );
  });
}

function waitForBackend(retries = 100) {
  const req = http.get(START_URL, () => {
    if (!isSpringReady) {
      isSpringReady = true;
      if (!mainWindow) createWindow();
    } else {
      mainWindow.loadURL(START_URL);
    }
  });

  req.on("error", () => {
    if (retries > 0) {
      setTimeout(() => waitForBackend(retries - 1), 1500);
    } else {
      dialog.showMessageBoxSync({
        type: "error",
        title: "Bağlantı Hatası",
        message:
          "Uygulama yerel sunucuya bağlanamadı.\n\nLütfen arka planda başka bir uygulamanın portu meşgul etmediğinden emin olun ve uygulamayı yeniden çalıştırın.",
        buttons: ["Tamam"],
      });

      console.log("Bağlantı sınırı aşıldığı için uygulama kapatılıyor...");
      killSpring();
      app.exit(0);
    }
  });
}

app.whenReady().then(() => {
  startBackend();
  waitForBackend(15);
  checkUpdates();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && isSpringReady) {
      createWindow();
    }
  });
});

function killSpring() {
  if (!springBootProcess || springBootProcess.killed) return;

  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${springBootProcess.pid} /T /F`, {
        stdio: "ignore",
      });
    } else {
      springBootProcess.kill("SIGTERM");
      setTimeout(() => {
        if (!springBootProcess.killed) {
          springBootProcess.kill("SIGKILL");
        }
      }, 3000);
    }
  } catch (e) {
    console.error("Spring kill hatası:", e);
  }

  springBootProcess = null;
}

app.on("window-all-closed", () => {
  killSpring();
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  killSpring();
});

app.on("before-quit", () => {
  killSpring();
});

process.on("SIGINT", () => {
  killSpring();
  app.quit();
});

process.on("SIGTERM", () => {
  killSpring();
  app.quit();
});

process.on("exit", () => {
  killSpring();
});

process.on("uncaughtException", (err) => {
  console.error("Beklenmedik Hata:", err);
  killSpring();
  app.exit(1);
});
