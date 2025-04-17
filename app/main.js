require('electron-reload')(__dirname);

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const DataService = require('./services/DataService');

require('./controllers/IncomeController');
require('./controllers/ExpenseController');

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    let win = new BrowserWindow({
        width: width,
        height: height,
        minWidth: width,  
        minHeight: height,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.webContents.openDevTools();
    win.loadFile(path.join(__dirname, 'renderer/views/index.html'));

    ipcMain.on('load-data', (event) => {
        const data = DataService.loadData();
        event.sender.send('load-data-response', data);
    });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(); 
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});