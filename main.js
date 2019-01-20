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


var loadedIds = new Array();
//process.env.NODE_ENV = 'production'

let mainWindow

function updateLight(light) {
    mainWindow.webContents.send('light:update', light)
}

function addLight(light) {
    loadedIds.push(light.id)
    database.ref('/lights/' + light.id + '/').on('value', function (snapshot) {
        var updatedlight = {
            id: light.id,
            duskSensorReadings: snapshot.val().duskSensorReadings,
            duskThreshold: snapshot.val().duskThreshold,
            led: snapshot.val().led,
            mode: snapshot.val().mode,
            turnOffTime: {
                hour: snapshot.val().turnOffTime.hour,
                minute: snapshot.val().turnOffTime.minute
            },
            turnOnTime: {
                hour: snapshot.val().turnOnTime.hour,
                minute: snapshot.val().turnOnTime.minute
            }
        }
        updateLight(updatedlight)
    })
    mainWindow.webContents.send('light:add', light)

}



function clearLightsFromMainWindow() {
    for (key in loadedIds) {
        mainWindow.webContents.send('light:remove', loadedIds[key])
    }
    loadedIds.length = 0
}

function getLightsFromDBToMainWindow() {
    database.ref('/lights/').once('value').then(function (snapshot) {
        var lights = snapshot.val()
        for (var key in lights) {
            var light = {
                id: key,
                duskSensorReadings: lights[key].duskSensorReadings,
                duskThreshold: lights[key].duskThreshold,
                led: lights[key].led,
                mode: lights[key].mode,
                turnOffTime: {
                    hour: lights[key].turnOffTime.hour,
                    minute: lights[key].turnOffTime.minute
                },
                turnOnTime: {
                    hour: lights[key].turnOnTime.hour,
                    minute: lights[key].turnOnTime.minute
                }
            }
            addLight(light)
        }
    })
}



var mainMenuTemplate = [{
    label: 'Ligh-ting',
    submenu: [
        {
            label: 'Update from DB',
            click() {
                clearLightsFromMainWindow()
                getLightsFromDBToMainWindow()
            }
        },
        {
            label: 'clear',
            click() {
                clearLightsFromMainWindow()
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
    getLightsFromDBToMainWindow()

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