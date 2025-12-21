// Don't touch this file for all this is holy
const SERVICE_WORKER_FILE_PATH = "./sw.js";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function notificationUnsupported(): boolean {
    const isIos = /iP(ad|hone|od)/.test(navigator.userAgent);
    return !(
        !isIos &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "showNotification" in ServiceWorkerRegistration.prototype
    );
}

export function checkPermissionStateAndAct(
    onSubscribe: (subs: PushSubscription | null) => void,
): void {
    const state: NotificationPermission = Notification.permission;
    if (state === "granted") {
        registerAndSubscribe(onSubscribe);
    }
}

async function ensureSubscription(
    reg: ServiceWorkerRegistration,
): Promise<PushSubscription> {
    const vapidKey = process.env.VAPID_PUBLIC_KEY;
    if (!vapidKey) throw new Error("Missing VAPID_PUBLIC_KEY");

    const convertedKey = urlBase64ToUint8Array(vapidKey);

    try {
        return await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
        });
    } catch (e) {
        console.warn("Subscription mismatch detected. Attempting a heal...", e);

        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
            await existingSub.unsubscribe();
        }

        return await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
        });
    }
}

async function subscribeOnce(
    onSubscribe: (subs: PushSubscription | null) => void,
): Promise<void> {
    try {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await ensureSubscription(reg);

        console.info("Subscription active:", subscription.toJSON());
        onSubscribe(subscription);
    } catch (e) {
        console.error("Failed to subscribe/heal:", e);
    }
}

export async function isSubscribed(teamId: string): Promise<boolean> {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    const endpoint = sub?.endpoint;

    if (!endpoint) return false;

    const res = await fetch("https://lunanova.space/cgi-bin/is_subscribed.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId, endpoint }),
    });

    const { subscribed } = await res.json();
    return subscribed;
}

export async function subscribeToTeam(teamId: string) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;

    const sub = await ensureSubscription(reg);

    await fetch("https://lunanova.space/cgi-bin/subscribe.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            team_id: teamId,
            subscription: sub.toJSON(),
        }),
    });
}

export async function unsubscribeFromTeam(teamId: string) {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    const endpoint = sub?.endpoint;

    if (!endpoint) return;

    await fetch("https://lunanova.space/cgi-bin/unsubscribe.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId, endpoint }),
    });
}

export async function registerAndSubscribe(
    onSubscribe: (subs: PushSubscription | null) => void,
): Promise<void> {
    try {
        await navigator.serviceWorker.register(SERVICE_WORKER_FILE_PATH);
        await subscribeOnce(onSubscribe);
    } catch (e) {
        console.error("Failed to register service worker:", e);
    }
}
