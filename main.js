const {
  app,
  BrowserWindow,
  screen,
  globalShortcut,
  ipcMain,
  dialog,
} = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const server = require('./server');
const fs = require('fs');
const path = require('path');

let mainWindow;
let secondWindow;

// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
log.info('Log file location:', log.transports.file.getFile().path);

app.on('ready', () => {
  // Start Express server on localhost:3000
  server.listen(3000, () => {
    log.info('Server running at http://localhost:3000/');
  });

  // Get the displays
  const displays = screen.getAllDisplays();

  // Function to handle fullscreen events
  const handleFullScreenEvents = (window) => {
    window.on('enter-full-screen', () => {
      window.setMenuBarVisibility(false);
    });

    window.on('leave-full-screen', () => {
      window.setMenuBarVisibility(true);
    });

    // Hide menu bar on app start
    window.setMenuBarVisibility(false);
  };

  // Create the first window on the primary display
  const mainWindowOptions = {
    width: 800,
    height: 600,
    frame: true,
    icon: path.join(__dirname, 'assets/icons/icon.ico'),
    fullscreen: displays.length > 1,
    webPreferences: {
      preload: path.join(__dirname, './public/preload.js'),
    },
  };

  if (displays.length > 1) {
    mainWindowOptions.x = displays[1].bounds.x;
    mainWindowOptions.y = displays[1].bounds.y;
  } else {
    mainWindowOptions.x = displays[0].bounds.x + 50;
    mainWindowOptions.y = displays[0].bounds.y + 50;
  }

  mainWindow = new BrowserWindow(mainWindowOptions);

  // Load the Express app in the first window
  mainWindow.loadURL('http://localhost:3000');

  // Attach fullscreen event handlers to the first window
  handleFullScreenEvents(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  // Create the second window
  const secondWindowOptions = {
    width: 800,
    height: 600,
    frame: true,
    icon: path.join(__dirname, 'assets/icons/icon.ico'),
    fullscreen: displays.length > 1,
    webPreferences: {
      preload: path.join(__dirname, './public/preload.js'),
    },
  };

  secondWindowOptions.x = displays[0].bounds.x;
  secondWindowOptions.y = displays[0].bounds.y;

  secondWindow = new BrowserWindow(secondWindowOptions);

  // Load the Express app in the second window
  secondWindow.loadURL('http://localhost:3000/admin');

  // Attach fullscreen event handlers to the second window
  handleFullScreenEvents(secondWindow);

  secondWindow.on('closed', () => {
    secondWindow = null;
    app.quit();
  });

  // Register a global shortcut for F11 to toggle fullscreen mode for both windows
  globalShortcut.register('F11', () => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
    if (secondWindow) {
      secondWindow.setFullScreen(!isFullScreen);
    }
  });

  // Listen for the close-windows event from the renderer process
  ipcMain.on('close-windows', () => {
    if (mainWindow) mainWindow.close();
    if (secondWindow) mainWindow.close();
  });

  // Listen for the change-page event from the renderer process
  ipcMain.on('change-page', (event, page) => {
    if (secondWindow) {
      mainWindow.loadURL(`http://localhost:3000/${page}`);
    }
  });

  // Listen for the get-com-ports event from the renderer process
  ipcMain.handle('get-com-ports', async () => {
    const SerialPort = require('serialport');
    const ports = await SerialPort.list();
    return ports;
  });

  // Make default directories if they don't exist
  const dataDir = path.join(__dirname, 'data');
  const scoresDir = path.join(dataDir, 'scores');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    if (!fs.existsSync(scoresDir)) {
      fs.mkdirSync(scoresDir);
    }
  }

  // Check for updates
  log.info('Checking for updates...');
  autoUpdater.checkForUpdatesAndNotify();

  // Set up auto-updater events
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    // Show a notification about the update being available
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. Downloading now...',
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
  });

  autoUpdater.on('error', (err) => {
    log.error('Update error:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let percent = progressObj.percent;
    log.info(`Download progress: ${percent}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    // Show dialog asking user to install the update
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version is ready to install. Do you want to restart?',
        buttons: ['Restart', 'Later'],
      })
      .then((result) => {
        if (result.response === 0) {
          // Restart the app to apply the update
          autoUpdater.quitAndInstall();
        }
      });
  });

  // Additional logging and validation
  autoUpdater.on('update-available', (info) => {
    if (info.version && info.version !== app.getVersion()) {
      log.info('Update available:', info);
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Downloading now...`,
      });
    } else {
      log.info(
        'False update notification. Current version:',
        app.getVersion(),
        'Update info:',
        info
      );
    }
  });
});

// Quit app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Unregister all shortcuts when the app quits
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
