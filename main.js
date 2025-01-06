const {
  app,
  BrowserWindow,
  screen,
  globalShortcut,
  ipcMain,
} = require('electron');
const server = require('./server');
const fs = require('fs');
const path = require('path');

let mainWindow;
let secondWindow;

app.on('ready', () => {
  // Start Express server on localhost:3000
  server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
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

    // Optionally, hide menu bar on app start
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
    if (secondWindow) secondWindow.close();
  });

  // Listen for the change-page event from the renderer process
  ipcMain.on('change-page', (event, page) => {
    if (secondWindow) {
      mainWindow.loadURL(`http://localhost:3000/${page}`);
    }
  });

  // Make default directories if they don't exist
  const dataDir = './data';
  const scoresDir = './data/scores';

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  if (!fs.existsSync(scoresDir)) {
    fs.mkdirSync(scoresDir);
  }
});

// Quit app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Unregister all shortcuts when the app quits
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
