import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { Colors } from "@blueprintjs/core";

let mainWindow: Electron.BrowserWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        backgroundColor: Colors.DARK_GRAY2,
        webPreferences: {
          nodeIntegration: true,
        },
        titleBarStyle: "default",
    });

    // and load the index.html of the app.
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, './index.html'),
            protocol: 'file:',
            slashes: true,
        })
    );

    // And create the menu
    const template = [{
        label: app.getName(),
        submenu: [
            { label: "Preferences...", accelerator: "CmdOrCtrl+,", click: () => mainWindow.webContents.send("showPreferences")},
            { role: "toggleDevTools", accelerator: "CmdOrCtrl+Alt+I" },
            { role: "forceReload", accelerator: "CmdOrCtrl+Shift+R"},
            { type: "separator"},
            { role: "quit", accelerator: "Command+Q", click: () => { app.quit(); }},
        ]}, {
        label: "File",
        submenu: [
            { label: "New File", accelerator: "CmdOrCtrl+N", click: () => { mainWindow.webContents.send("new"); }},
            { label: "Open...", accelerator: "CmdOrCtrl+O", click: () => { mainWindow.webContents.send("open"); }},
            { type: "separator"},
            { label: "Save", accelerator: "CmdOrCtrl+S", click: () => { mainWindow.webContents.send("save"); }},
            { type: "separator"},
            { label: "Render PDF", accelerator: "CmdOrCtrl+R", click: () => { mainWindow.webContents.send("render"); }},
        ]},{
        label: "Edit",
        submenu: [
            // { role: "undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            // { role: "redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { role: "cut", accelerator: "CmdOrCtrl+X", selector: "cut:", click: () => { mainWindow.webContents.send("cut"); } },
            { role: "copy", accelerator: "CmdOrCtrl+C", selector: "copy:", click: () => { mainWindow.webContents.send("copy"); } },
            { role: "paste", accelerator: "CmdOrCtrl+V", selector: "paste:", click: () => { mainWindow.webContents.send("paste"); } },
            // { role: "select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}, {
        label: "View",
        submenu: [
            { role: "togglefullscreen", accelerator: "Command+Control+F"},
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template as any));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
