/**
 * NUR Lingo — Service Worker
 * Handles background notifications.
 */

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {
    title: 'NUR Lingo 🍎',
    body: 'Time for your Armenian lesson!'
  };

  const options = {
    body: data.body,
    icon: '/images/nuri/nuri-happy.png',
    badge: '/favicon.ico',
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
