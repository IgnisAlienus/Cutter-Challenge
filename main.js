// filepath: /c:/Cutter-Challenge/main.js
const {
  app,
  BrowserWindow,
  screen,
  globalShortcut,
  ipcMain,
} = require('electron');
const server = require('./server');
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
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    icon: path.join(__dirname, './public/resources/cutterLogo.png'),
    fullscreen: true,
    x: displays[1].bounds.x,
    y: displays[1].bounds.y,
    webPreferences: {
      preload: path.join(__dirname, './public/preload.js'),
    },
  });

  // Load the Express app in the first window
  mainWindow.loadURL('http://localhost:3000');

  // Attach fullscreen event handlers to the first window
  handleFullScreenEvents(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  // Create the second window on the secondary display
  if (displays.length > 1) {
    secondWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: true,
      icon: path.join(__dirname, './public/resources/cutterLogo.png'),
      fullscreen: true,
      x: displays[0].bounds.x,
      y: displays[0].bounds.y,
      webPreferences: {
        preload: path.join(__dirname, './public/preload.js'),
      },
    });

    // Load the Express app in the second window
    secondWindow.loadURL('http://localhost:3000/admin');

    // Attach fullscreen event handlers to the second window
    handleFullScreenEvents(secondWindow);

    secondWindow.on('closed', () => {
      secondWindow = null;
      app.quit();
    });
  }

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
});

// Quit app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Unregister all shortcuts when the app quits
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
