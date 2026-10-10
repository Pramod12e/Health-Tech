import { getAllQueued, removeQueued } from "./db";
import axiosClient from "../api/axiosClient";

let isSyncing = false;

export async function syncQueuedRequests() {
  if (isSyncing) return; // avoid running twice at the same time
  isSyncing = true;

  try {
    const queued = await getAllQueued();
    for (const item of queued) {
      try {
        await axiosClient({
          url: item.url,
          method: item.method,
          data: item.data,
        });
        await removeQueued(item.id); // only remove after confirmed success
      } catch (err) {
        // still offline or server error — leave it in the queue, try again next time
        console.log("Sync failed for item, will retry later:", item.id);
      }
    }
  } finally {
    isSyncing = false;
  }
}

// Call this once when the app starts
export function setupAutoSync() {
  // try syncing immediately on load (in case there's leftover queued data)
  if (navigator.onLine) syncQueuedRequests();

  // try syncing the moment the browser regains internet
  window.addEventListener("online", () => {
    syncQueuedRequests();
  });
}