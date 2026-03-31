importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDmkFae7Ih2m8pEjVQW38IZAeOFDLrjr3U",
  authDomain: "gc-clock-pro-track.firebaseapp.com",
  projectId: "gc-clock-pro-track",
  storageBucket: "gc-clock-pro-track.firebasestorage.app",
  messagingSenderId: "512984415601",
  appId: "1:512984415601:web:868b91583b2aac0a6ecad0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'GC Clock Pro Track', {
    body: body || '',
    icon: icon || '/logo192.png',
    badge: '/favicon.ico',
    tag: 'gc-checkin',
    renotify: true,
    data: payload.data || {}
  });
});
