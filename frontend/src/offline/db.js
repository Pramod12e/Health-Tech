import { openDB } from "idb";

const DB_NAME = "telehealth-offline-db";
const STORE_NAME = "pendingRequests";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

// Save a request that failed due to no internet
export async function queueRequest(request) {
  const db = await getDB();
  await db.add(STORE_NAME, {
    ...request,          // { url, method, data, type }
    createdAt: Date.now(),
  });
  window.dispatchEvent(new Event("queue-changed"));
}

// Get all pending (unsent) requests
export async function getAllQueued() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

// Remove one request after it's successfully sent
export async function removeQueued(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  window.dispatchEvent(new Event("queue-changed"));
}
