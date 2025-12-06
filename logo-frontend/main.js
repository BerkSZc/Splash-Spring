import { app, BrowserWindow } from "electron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

let springBootProcess;
let mainWindow;
let isSpringReady = false;

// Spring Boot'un çalışacağı portu belirleyin (Spring varsayılanı 8080)
const SPRING_PORT = 8080;
const START_URL = `http://localhost:${SPRING_PORT}`;

// Dağıtılabilir uygulamanın içindeki dosyalara erişmek için güvenli bir yol oluşturucu.
const getAssetPath = (assetName) => {
  return app.isPackaged
    ? path.join(process.resourcesPath, assetName)
    : path.join(app.getAppPath(), assetName);
};
// 1. Electron penceresini oluşturur ve Spring Boot adresini yükler.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800, // Minimum genişlik
    minHeight: 600, // Minimum yükseklik
    center: true, // Ekranın ortasında açılmasını sağlar

    // Geleneksel Masaüstü Görünümü Ayarları
    autoHideMenuBar: true, // Menü çubuğunu gizler
    // frame: false, // Eğer Windows başlık çubuğunu tamamen kaldırmak isterseniz

    webPreferences: {
      // Güvenlik ayarlarınız
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // Spring Boot'un çalıştığı adresi yükle
  mainWindow.loadURL(START_URL);

  // Opsiyonel: Geliştirme araçlarını açmak için
  // mainWindow.webContents.openDevTools();
}

// 2. Spring Boot arka ucu başlatma ve izleme
function startBackend() {
  // backend.jar dosyasının paketin içinde doğru konumda olduğundan emin olun.
  const jarPath = getAssetPath("backend.jar");

  console.log(`[INFO] Spring Boot JAR yolu: ${jarPath}`);

  springBootProcess = spawn("java", ["-jar", jarPath], {
    cwd: app.isPackaged ? process.resourcesPath : app.getAppPath(),
    shell: true,
  });

  // Spring Boot çıktılarını izle
  springBootProcess.stdout.on("data", (data) => {
    const dataString = data.toString();
    console.log(`[Spring Boot STDOUT]: ${dataString.trim()}`);

    // Spring Boot'un başarılı bir şekilde başladığını gösteren log satırını kontrol et.
    // (Genellikle Tomcat veya Jetty'nin başladığına dair bir mesaj içerir.)
    if (!isSpringReady && dataString.includes("Tomcat started on port")) {
      isSpringReady = true;
      console.log("[INFO] Spring Boot BAŞLADI. Pencere oluşturuluyor...");
      createWindow();
    }
  });

  springBootProcess.stderr.on("data", (data) => {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "spring-error.log"),
      data.toString()
    );
  });

  springBootProcess.on("error", (err) => {
    console.error(`[FATAL] Spring Boot başlatılamadı: ${err.message}`);
    app.quit(); // Hata durumunda uygulamadan çık
  });

  springBootProcess.on("close", (code) => {
    console.log(`[INFO] Spring Boot Süreci sonlandı. Çıkış kodu: ${code}`);
    // Arka uç beklenmedik şekilde kapanırsa Electron'u da kapatabilirsiniz.
    if (code !== 0 && code !== null) {
      // app.quit();
    }
  });
}

// 3. Electron Hazır olduğunda arka ucu başlat
app.whenReady().then(() => {
  startBackend();

  // macOS'te dock ikonuna tıklanınca yeniden açılma (Windows/Linux için gerekli değil)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && isSpringReady) {
      createWindow();
    }
  });
});

// 4. Tüm pencereler kapandığında Spring Boot'u sonlandır
app.on("window-all-closed", () => {
  // macOS dışındaki platformlarda uygulamayı kapat.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function killSpring() {
  if (!springBootProcess) return;

  if (process.platform === "win32") {
    // Windows
    spawn("taskkill", ["/PID", springBootProcess.pid, "/T", "/F"]);
  } else {
    // Linux / macOS
    try {
      process.kill(-springBootProcess.pid); // process group kill
    } catch (e) {
      console.error("Kill error:", e);
    }
  }
}

app.on("quit", () => {
  killSpring();
});
