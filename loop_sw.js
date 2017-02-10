self.addEventListener('install', function(event) {
    // Perform install steps
    // https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
    // https://developers.google.com/web/fundamentals/getting-started/codelabs/push-notifications/
    console.log("service worker is installing stuff, like cache");
});

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Codelab';
    const options = {
        body: 'Yay it works.',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/')
    );
});