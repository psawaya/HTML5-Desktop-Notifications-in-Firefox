window.notifications = {
    createNotification: function createNotification(iconURL,title,text) {
        var notifObj = {
            show: function show() {
                self.postMessage({ type: 'regular', args: {
                        iconURL: iconURL,
                        title: title,
                        text: text 
                    }
                });
            }
        };
        return notifObj;
    },
    createHTMLNotification: function createHTMLNotification(url) {
        self.postMessage({ type: 'html', args: arguments });
    },
    checkPermission: function checkPermission() {        
        return window.notifications.permissionAllowed;
    },
    // Real copy of permissions is kept in main.js, 
    // this is just used for checkPermission(), which isn't async.
    permissionAllowed: 1, // 1 == PERMISSION_NOT_ALLOWED
    permissionCallback: function emptyPermissionCallback() {},
    requestPermission: function requestPermission(callback) {
        // TODO: ask permission.
        self.postMessage({
            type:'permission',
            args: {
            }
        });
        
        this.permissionCallback = callback;
        
        return true;
    }
};

self.port.on('authDecision', function (msg) {
    if (msg['type'] != 'authresult') return;
    
    window.notifications.permissionAllowed = msg['value'] ? 0 : 1;
    
    // TODO: PERMISSION_DENIED
    if (msg['value'])
        window.notifications.permissionCallback(0); // PERMISSION_ALLOWED
    else
        window.notifications.permissionCallback(1); // PERMISSION_NOT_ALLOWED
});

window.webkitNotifications = window.notifications;
window.mozillaNotifications = window.notifications;