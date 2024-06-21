import { useRef, useMemo, useCallback, useSyncExternalStore } from "react";
import {
  type StoreApi,
  type Mutate,
  type StoreMutatorIdentifier,
} from "zustand";
import { shallow } from "zustand/shallow";

type State = Record<string, unknown>;

/**
 * Generic hook to use a store with a proxy to only re-render when the used keys change
 * @param store - The store object created with `createStore` or similar.
 * @defaultValue shallow @param equalityFn - The equality function to compare the values of the used keys.
 * @returns - The store object with a proxy to to only re-render when the used keys change.
 */
export function useProxyStore<
  S extends State,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(
  store: Mutate<StoreApi<S>, Mos>,
  equalityFn: (a: unknown, b: unknown) => boolean = shallow,
): Mutate<StoreApi<S>, Mos> {
  const usedKeyRef = useRef<string[]>([]);

  const handler = useMemo(
    () => ({
      get(target: Mutate<StoreApi<S>, Mos>, prop: string): unknown {
        usedKeyRef.current.push(prop);
        return target.getState()[prop];
      },
    }),
    [],
  );

  const proxyRef = useRef(new Proxy(store, handler));

  const subscribe = useCallback(
    (callback: () => void) =>
      store.subscribe((state, prevState) => {
        if (usedKeyRef.current.length) {
          for (const prop of usedKeyRef.current) {
            // If the value changed, create a new proxy and call the callback to re-render and return the new proxy.
            if (!equalityFn(prevState[prop], state[prop])) {
              proxyRef.current = new Proxy(store, handler);
              callback();
              break;
            }
          }
        }
      }),
    [store, equalityFn, handler],
  );

  return useSyncExternalStore(subscribe, () => proxyRef.current);
}
