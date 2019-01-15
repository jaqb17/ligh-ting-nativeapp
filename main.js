const electron = require('electron')
const url = require('url')
const path = require('path')
const shell = require('electron').shell

const { app, BrowserWindow, Menu, ipcMain } = electron

process.env.NODE_ENV = 'production'

let mainWindow

const mainMenuTemplate = [
    {
        label: 'Ligh-ting',
        submenu: [
            {
                label: 'Open Firebase in browser',
                click(){
                    shell.openExternal('https://console.firebase.google.com/project/light-ting/database/light-ting/data')
                }
            },
            { type: 'separator'},
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]
    }
]

app.on('ready', function(){
    mainWindow = new BrowserWindow({})

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', function() {
        app.quit()
    })

 

})