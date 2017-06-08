var CUSTOM_ACTION_URL;

self.addEventListener('install', function(event) {
    // Perform install steps
    // https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
    // https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
    // console.log("service worker is installing stuff, like cache");
});

self.addEventListener('push', function(event) {
    // console.log('[Service Worker] Push Received.');
    // console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    var jsonData = event.data.json();
    
    var customUrlAction = (jsonData.actions || []).filter(action => action.title == 'url');
    if( customUrlAction.length > 0 ){
        CUSTOM_ACTION_URL = customUrlAction[0].action;
    }
    
    const title = jsonData.title;
    const options = {
        body: jsonData.body,
        icon: jsonData.icon,
        badge: jsonData.icon || "https://buzzapp.rocks/images/sample_push_icon.png",
        tag: 'goodbytes-buzz-push', // this re-uses an existing notification
        actions: (jsonData.actions || []).filter(action => action.title !== 'url')
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    //https://github.com/cretueusebiu/laravel-web-push-demo/blob/master/public/sw.js
    
    // console.log('[Service Worker] Notification click Received.');
    // console.log(event);

    var customUrlToOpen = CUSTOM_ACTION_URL || '/';
    
    event.notification.close();
        event.waitUntil(
            clients.openWindow( customUrlToOpen )
        );    
});