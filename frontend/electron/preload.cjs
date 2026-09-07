const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("overlay", {
  setClickThrough(ignore) {
    ipcRenderer.send("set-click-through", Boolean(ignore));
  },
  moveBy(dx, dy) {
    ipcRenderer.send("move-by", dx, dy);
  },
  getVoice() {
    return ipcRenderer.invoke("get-voice");
  },
  setVoice(id) {
    ipcRenderer.send("set-voice", id);
  },
  onVoiceChanged(callback) {
    const listener = (_event, id) => callback(id);
    ipcRenderer.on("voice-changed", listener);
    return () => ipcRenderer.removeListener("voice-changed", listener);
  },
  showMenu() {
    ipcRenderer.send("show-menu");
  },
  quit() {
    ipcRenderer.send("quit");
  },
});
