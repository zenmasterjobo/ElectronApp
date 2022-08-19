const { BrowserWindow } = require('electron');
const authService = require('../services/auth-service');
const createAppWindow = require('../main/app-process');

let win = null;

function createAuthWindow() {
  destroyAuthWin();

  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  win.loadURL(authService.getAuthenticationURL());

  const { session: { webRequest } } = win.webContents;

  const filter = {
    urls: [
      'http://localhost/callback*'
    ]
  };

  webRequest.onBeforeRequest(filter, async ({ url }) => {
    await authService.loadTokens(url);
    createAppWindow();
    return destroyAuthWin();
  });

  win.on('authenticated', () => {
    destroyAuthWin();
  });

  win.on('closed', () => {
    win = null;
  });
}

function destroyAuthWin() {
  if (!win) return;
  win.close();
  win = null;
}

function createLogoutWindow() {
  const logoutWindow = new BrowserWindow({
    show: false,
  });

  logoutWindow.loadURL(authService.getLogOutUrl());

  logoutWindow.on('ready-to-show', async () => {
    await authService.logout();
    logoutWindow.close();
  });
}

function createSquareWindow() {
  destroyAuthWin();
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false
    }
  })
  win.loadURL(authService.getSquareAuthURL());

  const { session: { webRequest } } = win.webContents;

  const filter = {
    urls: [
      'http://localhost/square/callback*'
    ]
  };

  webRequest.onBeforeRequest(filter, async ({ url }) => {
    await authService.loadTokens(url);
    createAppWindow();
    return destroyAuthWin();
  });

  webRequest.onBeforeRequest(filter, async ({ url }) => {
    createAppWindow();
  });


  win.on('authenticated', () => {
    destroyAuthWin();
  });

  win.on('closed', () => {
    win = null;
  });
}


function createDevDashboardWindow() {
  destroyAuthWin();
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false
    }
  })
  win.loadURL("https://developer.squareup.com");

  win.on('closed', () => {
    win = null;
  });
}

module.exports = {
  createDevDashboardWindow,
  createAuthWindow,
  createLogoutWindow,
  createSquareWindow
};
