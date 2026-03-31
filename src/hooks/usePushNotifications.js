import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import app from '../firebase';

const VAPID_KEY = 'BPs3MkUQv0aTePBuJpOJRKAWC1E5mhVTrp0EWfAiB2wYl-OHquoPNDInSFCwesEzL_oyN8UrXUMM-R3a2nw5LRM';

export function usePushNotifications(userId, role) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [token, setToken]       = useState(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('Notification' in window && 'serviceWorker' in navigator);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        // Lazy load messaging only when needed
        const { getMessaging, getToken } = await import('firebase/messaging');
        const messaging = getMessaging(app);
        const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: sw
        });
        if (fcmToken && userId) {
          await setDoc(doc(db, 'fcmTokens', userId), {
            token: fcmToken, role, userId,
            updatedAt: new Date().toISOString()
          });
          setToken(fcmToken);
        }
        return true;
      }
    } catch(e) {
      console.warn('Push setup error:', e.message);
    }
    return false;
  }, [supported, userId, role]);

  useEffect(() => {
    if (!userId || !supported) return;
    getDoc(doc(db, 'fcmTokens', userId))
      .then(snap => { if (snap.exists()) setToken(snap.data().token); })
      .catch(() => {});
  }, [userId, supported]);

  return { permission, token, supported, requestPermission };
}
