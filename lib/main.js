// HTML5 Desktop Notifications

const dataDir = require("self").data;
const notifications = require("notifications");
const pageMod = require("page-mod");
const panel = require("panel");
const tabBrowser = require("tab-browser");
const url = require("url");


// Dictionary of hostnames that are allowed to show notifications.
var SITES_ALLOWED = {};

function createNotificationsHook() {
    pageMod.PageMod({
        include: "*",
        contentScriptFile: dataDir.url('notifsPageMod.js'),
        onAttach: function(worker,mod) {
            worker.on('message',function(msg) {
                if (msg['type'] == 'regular') {
                    console.log("Can auth: " + this.canAuth());
                    if (!this.canAuth()) return false;
                    var msgArgs = msg.args;
                    var notifObj = {
                        title: msgArgs['title'] ? msgArgs['title'] : 'Notification',
                        text: msgArgs['text'] ? msgArgs['text'] : '',
                        iconURL: msgArgs['iconURL'] ? msgArgs['iconURL'] : undefined,
                        data: 'data string.',
                        onClick: function (data) {
                          console.log(data);
                        }
                    };
                    notifications.notify(notifObj);
                }
                else if (msg['type'] == 'permission') {
                    console.log(msg['args'].win);
                    var currentWorker = worker;
                    askNotificationsPermission(function callback(authResult) {
                        worker.port.emit('authDecision', {
                            type: 'authresult',
                            value: authResult
                        });
                        
                        if (authResult) {
                            // If the user accepts notifications, authorize entire hostname.
                            var workerHostname =  getHostnameFromURL(worker.tab.url);
                            SITES_ALLOWED[workerHostname] = true;
                        }                        
                    });
                }
            });
            worker.canAuth = function canAuth() {
                return SITES_ALLOWED[getHostnameFromURL(this.tab.url)];
            }
        }
    });
}
createNotificationsHook();

function getHostnameFromURL(_url) {
    return url.URL(_url).host;
}

function askNotificationsPermission(callback) {
    var canHidePanel = true;
    
    var authPanel = panel.Panel({
        contentURL: dataDir.url('auth.html'),
        contentScriptFile: dataDir.url('auth.js'),
        contentScriptWhen: 'ready',
        onMessage: function(msg) {
            canHidePanel = true;
            this.hide();
            callback(msg['authDecision']);
        },
        onHide: function() {
            // Cheesy way of making sure the panel doesn't disappear when you click off.
            if (!canHidePanel)
                this.show();
        },
    });
    
    authPanel.show();
    canHidePanel = false;
    
}