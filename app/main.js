require('electron-reload')(__dirname);

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const DataService = require('./services/DataService');

require('./controllers/IncomeController');
require('./controllers/ExpenseController');

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const windowWidth = 600; 
    const windowHeight = 900;
    const xPos = width - windowWidth;  

    let win = new BrowserWindow({
        width: windowWidth, /* 1200 */
        height: windowHeight, /* 800 */
        x: xPos,
        y: 0,
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