const { app, BrowserWindow, ipcMain, Menu, screen } = require("electron");
const fs = require("fs");
const path = require("path");

const RENDERER_URL = process.env.AMADEUS_RENDERER_URL || "http://127.0.0.1:5173/";
const WINDOW_WIDTH = 520;
const WINDOW_HEIGHT = 720;
const VOICES = ["en", "ja"];
const VOICE_LABELS = { en: "English", ja: "Japanese" };
const DEFAULT_VOICE = "en";

app.setName("Amadeus Overlay");
app.commandLine.appendSwitch("enable-transparent-visuals");

let currentVoice = DEFAULT_VOICE;
let overlayWindow = null;

function voiceFile() {
  return path.join(app.getPath("userData"), "overlay-voice.json");
}

function loadVoice() {
  try {
    const raw = JSON.parse(fs.readFileSync(voiceFile(), "utf8"));
    if (raw && VOICES.includes(raw.id)) return raw.id;
  } catch {
    // first run
  }
  return DEFAULT_VOICE;
}

function saveVoice(id) {
  try {
    fs.writeFileSync(voiceFile(), `${JSON.stringify({ id })}\n`);
  } catch {
    // still applies this session
  }
}

function setVoice(id) {
  if (!VOICES.includes(id)) return;
  currentVoice = id;
  saveVoice(id);
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send("voice-changed", id);
    installMenus(overlayWindow);
  }
}

function overlayMenuTemplate() {
  return [
    ...VOICES.map((id) => ({
      label: VOICE_LABELS[id],
      type: "radio",
      checked: currentVoice === id,
      click: () => setVoice(id),
    })),
    { type: "separator" },
    { label: "Quit Amadeus Overlay", role: "quit" },
  ];
}

function popupOverlayMenu(win) {
  Menu.buildFromTemplate(overlayMenuTemplate()).popup({ window: win });
}

function installMenus(win) {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: "Amadeus Overlay",
      submenu: overlayMenuTemplate(),
    },
  ]));
}

function overlayBounds() {
  const { workArea } = screen.getPrimaryDisplay();
  return {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: Math.round(workArea.x + workArea.width - WINDOW_WIDTH - 28),
    y: Math.round(workArea.y + workArea.height - WINDOW_HEIGHT - 16),
  };
}

function createOverlay() {
  const bounds = overlayBounds();
  const win = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: false,
    fullscreenable: false,
    minimizable: false,
    maximizable: false,
    acceptFirstMouse: true,
    roundedCorners: false,
    backgroundColor: "#00000000",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });

  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setMenuBarVisibility(false);

  win.once("ready-to-show", () => win.showInactive());
  win.on("closed", () => app.quit());

  win.webContents.on("context-menu", () => {
    popupOverlayMenu(win);
  });

  installMenus(win);
  void win.loadURL(RENDERER_URL);
  overlayWindow = win;
  return win;
}

ipcMain.on("set-click-through", (event, ignore) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (ignore) win.setIgnoreMouseEvents(true, { forward: true });
  else win.setIgnoreMouseEvents(false);
});

ipcMain.on("move-by", (event, dx, dy) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  const [x, y] = win.getPosition();
  win.setPosition(
    Math.round(x + (Number(dx) || 0)),
    Math.round(y + (Number(dy) || 0)),
  );
});

ipcMain.handle("get-voice", () => currentVoice);
ipcMain.on("set-voice", (_event, id) => setVoice(id));
ipcMain.on("show-menu", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) popupOverlayMenu(win);
});
ipcMain.on("quit", () => app.quit());

app.whenReady().then(() => {
  currentVoice = loadVoice();
  createOverlay();
});

app.on("window-all-closed", () => app.quit());
