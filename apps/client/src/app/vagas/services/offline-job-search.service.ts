import type { JobsResponse } from "@/lib/services/jobs.service";
import type { ContractType } from "@/types/job.types";

const DATABASE_NAME = "tl-pwa";
const DATABASE_VERSION = 1;
const STORE_NAME = "job-searches";
const LATEST_SEARCH_KEY = "latest";
const MAX_SNAPSHOT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface OfflineJobSearchFilters {
  query: string;
  radius: number;
  category: string | null;
  contractType: ContractType | null;
  city: string | null;
}

export interface OfflineJobSearchSnapshot {
  key: typeof LATEST_SEARCH_KEY;
  savedAt: number;
  filters: OfflineJobSearchFilters;
  response: JobsResponse;
}

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runRequest = <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) =>
  openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = operation(transaction.objectStore(STORE_NAME));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
          database.close();
          reject(transaction.error);
        };
      }),
  );

const isSnapshot = (value: unknown): value is OfflineJobSearchSnapshot => {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<OfflineJobSearchSnapshot>;
  return (
    candidate.key === LATEST_SEARCH_KEY &&
    typeof candidate.savedAt === "number" &&
    typeof candidate.filters === "object" &&
    candidate.filters !== null &&
    typeof candidate.response === "object" &&
    candidate.response !== null &&
    Array.isArray(candidate.response.data)
  );
};

export const saveOfflineJobSearch = (
  snapshot: Omit<OfflineJobSearchSnapshot, "key" | "savedAt">,
) =>
  runRequest("readwrite", (store) =>
    store.put({
      ...snapshot,
      key: LATEST_SEARCH_KEY,
      savedAt: Date.now(),
    }),
  );

export const readOfflineJobSearch = async () => {
  const result = await runRequest<unknown>("readonly", (store) =>
    store.get(LATEST_SEARCH_KEY),
  );

  if (!isSnapshot(result)) return null;

  if (Date.now() - result.savedAt > MAX_SNAPSHOT_AGE_MS) {
    await runRequest("readwrite", (store) => store.delete(LATEST_SEARCH_KEY));
    return null;
  }

  return result;
};
