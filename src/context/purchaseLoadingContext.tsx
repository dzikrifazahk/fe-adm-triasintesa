"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

export type PurchaseTabChannel =
  | "submission"
  | "verified"
  | "payment-request"
  | "paid"
  | undefined;

class PurchaseRefreshStore {
  private listeners = new Map<PurchaseTabChannel, Set<() => void>>();
  private versions = new Map<PurchaseTabChannel, number>();

  constructor() {
    (
      [
        "submission",
        "verified",
        "payment-request",
        "paid",
      ] as PurchaseTabChannel[]
    ).forEach((ch) => this.versions.set(ch, 0));
  }

  subscribe = (channel: PurchaseTabChannel, cb: () => void) => {
    if (!this.listeners.has(channel)) this.listeners.set(channel, new Set());
    this.listeners.get(channel)!.add(cb);
    return () => this.listeners.get(channel)!.delete(cb);
  };

  getVersion = (channel: PurchaseTabChannel) => {
    return this.versions.get(channel) ?? 0;
  };

  emit = (channel: PurchaseTabChannel) => {
    const next = (this.versions.get(channel) ?? 0) + 1;
    this.versions.set(channel, next);
    this.listeners.get(channel)?.forEach((fn) => fn());
  };
}

const StoreContext = createContext<PurchaseRefreshStore | null>(null);

export function PurchaseRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<PurchaseRefreshStore>(new PurchaseRefreshStore());
  if (!storeRef.current) storeRef.current = new PurchaseRefreshStore();
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function usePurchaseRefreshEmitter() {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error(
      "usePurchaseRefreshEmitter must be used within PurchaseRefreshProvider"
    );
  return store.emit;
}

/** Hook yang dipakai di page/tabel untuk subscribe ke channel */
export function usePurchaseRefreshVersion(channel: PurchaseTabChannel) {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error(
      "usePurchaseRefreshVersion must be used within PurchaseRefreshProvider"
    );

  // useSyncExternalStore untuk integrasi event eksternal secara stabil (anti hydration mismatch)
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return store.subscribe(channel, onStoreChange);
    },
    [store, channel]
  );

  const getSnapshot = useCallback(
    () => store.getVersion(channel),
    [store, channel]
  );
  const getServerSnapshot = useCallback(
    () => store.getVersion(channel),
    [store, channel]
  );

  const version = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return version; // number yang bertambah saat emit(channel)
}

/** Helper: jalankan effect tiap kali channel di-emit */
export function usePurchaseRefreshEffect(
  channel: PurchaseTabChannel,
  effect: () => void,
  deps: any[] = []
) {
  const version = usePurchaseRefreshVersion(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, [version, ...deps]);
}
