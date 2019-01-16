const electron = require('electron')
const url = require('url')
const path = require('path')
const shell = require('electron').shell
const ipc = require('electron').ipcMain
const firebase = require('firebase')

const { app, BrowserWindow, Menu, ipcMain } = electron
const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyB9yMeGp9hyzhInZgDiCKi9ba1lT5orz30",
    authDomain: "light-ting.firebaseapp.com",
    databaseURL: "https://light-ting.firebaseio.com",
    projectId: "light-ting",
    storageBucket: "",
    messagingSenderId: "131433570336"
})

var database = firebase.database()

//process.env.NODE_ENV = 'production'

let mainWindow

function addLight(light) {
    mainWindow.webContents.send('light:add', light)
}

function updateLight(light) {
    mainWindow.webContents.send('light:update', light)
}

function getLightsFromDBToMainWindow() {

}

var mainMenuTemplate = [{
    label: 'Ligh-ting',
    submenu: [
        {
            label: 'Update',
            click() {
                const light = {
                    id: 213,
                    duskSensorReadings: 0,
                    duskThreshold: 544,
                    led: true,
                    mode: 'OVERRIDE',
                    turnOffTime: {
                        hour: 23,
                        minute: 37
                    },
                    turnOnTime: {
                        hour: 23,
                        minute: 33
                    }
                }
                addLight(light)
            }
        },
        {
            label: 'Update2',
            click() {
                const light = {
                    id: 123,
                    duskSensorReadings: 2,
                    duskThreshold: 222,
                    led: false,
                    mode: 'TIME_ONLY',
                    turnOffTime: {
                        hour: 12,
                        minute: 12
                    },
                    turnOnTime: {
                        hour: 13,
                        minute: 13
                    }
                }
                updateLight(light)
            }
        },
        {
            label: 'Open Firebase in browser',
            click() {
                shell.openExternal('https://console.firebase.google.com/project/light-ting/database/light-ting/data')
            }
        },
        { type: 'separator' },
        {
            label: 'Exit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click() {
                app.quit()
            }
        }
    ]
}]


// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                role: 'reload'
            },
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    });
}

let menu = Menu.buildFromTemplate(mainMenuTemplate)

app.on('ready', function () {
    mainWindow = new BrowserWindow({})

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', function () {
        app.quit()
    })

    Menu.setApplicationMenu(menu)


})

ipc.on('switchChange', function (event, id, value) {

    database.ref('/lights/' + String(id).replace(/^\D+/g, '') + '/led/').set(value)
})

ipc.on('thresholdChange', function (event, id, value) {
    database.ref('/lights/' + String(id).replace(/^\D+/g, '') + '/duskThreshold/').set(value)
})

ipc.on('modeChange', function (event, id, value) {
    database.ref('/lights/' + String(id).replace(/^\D+/g, '') + '/mode/').set(value)
})

ipc.on('timeOnChange', function (event, id, value) {
    database.ref('/lights/' + String(id).replace(/^\D+/g, '') + '/turnOnTime/hour/').set(value.hour)
    database.ref('/lights/' + String(id).replace(/^\D+/g, '') + '/turnOnTime/minute/').set(value.minute)
})

ipc.on('timeOffChange', function (event, id, value) {
    database.ref('/lights/' + String(id).replace(/^\D+/g, '') + '/turnOffTime/hour/').set(value.hour)
    database.ref('/lights/' + String(id).replace(/^\D+/g, '') + '/turnOffTime/minute/').set(value.minute)
})