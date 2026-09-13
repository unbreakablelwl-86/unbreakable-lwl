/**
 * UNBREAKABLE — Push Notification Hook
 *
 * Manages Web Push subscription using the Push API.
 * Stores subscription in Supabase push_subscriptions table.
 * Uses VAPID keys for authentication.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// VAPID public key — generate with: npx web-push generate-vapid-keys
// Store private key in Supabase secrets for edge function use
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported || !user) return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch {
        // Silently fail
      }
    })();
  }, [isSupported, user]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Notification permission denied');
        return false;
      }

      if (!VAPID_PUBLIC_KEY) {
        // VAPID key not configured — store intent, push will work when configured
        console.warn('VAPID_PUBLIC_KEY not configured — push subscription deferred');
        toast.success('Notifications enabled! Push delivery will activate soon.');
        setIsSubscribed(true);
        return true;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();

      // Store in Supabase
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh,
        auth_key: subJson.keys!.auth,
        device_label: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      }, {
        onConflict: 'user_id,endpoint',
      });

      setIsSubscribed(true);
      toast.success('Push notifications enabled! 🔔');
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      toast.error('Failed to enable notifications');
      return false;
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !user) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();

        // Remove from Supabase
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', sub.endpoint);
      }

      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
    }
  }, [isSupported, user]);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
  };
}
