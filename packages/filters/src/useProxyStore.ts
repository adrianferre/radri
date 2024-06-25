import { useRef, useMemo, useCallback, useSyncExternalStore } from "react";
import type { StoreApi, Mutate } from "zustand";
import { shallow } from "zustand/shallow";

type StoreGenericType = Record<string, unknown>;

type StorePick<S> = Pick<Mutate<StoreApi<S>, []>, "getState" | "subscribe">;

/**
 * Generic hook to use a store with a proxy to only re-render when the used keys change
 * @param store - The store object created with `createStore` or similar.
 * @defaultValue shallow @param equalityFn - The equality function to compare the values of the used keys.
 * @returns - The store object with a proxy to to only re-render when the used keys change.
 */
export function useProxyStore<S extends StoreGenericType>(
  store: StorePick<S>,
  equalityFn: (a: unknown, b: unknown) => boolean = shallow
): { [K in keyof S]: S[K] } {
  const usedKeyRef = useRef<(keyof S)[]>([]);

  const handler = useMemo(
    () => ({
      get(_: S, prop: string) {
        usedKeyRef.current.push(prop);
        return store.getState()[prop];
      },
    }),
    [store]
  );

  const proxyRef = useRef(new Proxy(store.getState(), handler));

  const subscribe = useCallback(
    (callback: () => void) =>
      store.subscribe((state, prevState) => {
        if (usedKeyRef.current.length) {
          for (const prop of usedKeyRef.current) {
            // If the value changed, create a new proxy and call the callback to re-render and return the new proxy.
            if (!equalityFn(prevState[prop], state[prop])) {
              proxyRef.current = new Proxy(store.getState(), handler);
              callback();
              break;
            }
          }
        }
      }),
    [store, equalityFn, handler]
  );

  return useSyncExternalStore(
    subscribe,
    () => proxyRef.current,
    () => proxyRef.current
  );
}
