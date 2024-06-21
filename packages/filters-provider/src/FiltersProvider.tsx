"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { type Mutate } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";
import type { ParsedQs } from "qs";
import {
  type FiltersStoreApi,
  type FiltersStore,
  createFiltersStore,
} from "./FiltersStore";
import { useProxyStore } from "./useProxyStore";

export const FiltersContext = createContext<FiltersStoreApi | null>(null);

export type FilterKey = string;

export type FilterValue = undefined | string | string[] | ParsedQs | ParsedQs[];

export type Filters = Record<FilterKey, FilterValue>;

/**
 * Options for each filter to control how the filter will be handled.
 */
export type FiltersOptions = Record<
  FilterKey,
  {
    /**
     * If true, the filter key will be initialized with the value from the URL.
     * @defaultValue true
     * */
    getInitialValueFromUrl?: boolean;
    /**
     * If true, the filter key will be initialized with the value from the localStorage.
     * @defaultValue true
     * */
    getInitialValueFromLocalStorage?: boolean;
    /**
     * If true, the filter key will be set in the URL.
     * @defaultValue true
     * */
    setValueToUrl?: boolean;
    /**
     * If true, the filter key will be set in the localStorage.
     * @defaultValue true
     * */
    setValueToLocalStorage?: boolean;
  }
>;

export type FiltersProviderProps = {
  /**
   * Initial filters that will be used to initialize the store,
   * other values from the URL will be ignored.
   * @defaultValue \{\}
   */
  initialFilters?: Filters;
  /**
   * Options for each filter to control how the filter will be handled.
   * @defaultValue \{
   *  getInitialValueFromUrl: true,
   *  getInitialValueFromLocalStorage: true,
   *  setValueToUrl: true,
   *  setValueToLocalStorage: true
   * \}
   */
  filtersOptions?: FiltersOptions;
  /**
   * If true, the other query params in the URL will be kept when setting a filter.
   * @defaultValue true
   * */
  keepOtherQueryParams?: boolean;
  /**
   * The key that will be used to store the filters in the localStorage.
   * @defaultValue "__DEFAULT_LS_FILTERS_KEY__"
   */
  localStorageKey?: string;
  /**
   * The debounce time in milliseconds for the localStorage and URL updates.
   * @defaultValue 300
   */
  persistDebounce?: number;
  /**
   * The children that will have access to the filters.
   * */
  children?: ReactNode | ReactNode[];
};

export function FiltersProvider({
  initialFilters = {},
  filtersOptions = {},
  keepOtherQueryParams = true,
  localStorageKey = "__DEFAULT_LS_FILTERS_KEY__",
  persistDebounce = 300,
  children,
}: FiltersProviderProps): JSX.Element {
  const filtersStoreRef = useRef<FiltersStoreApi>();

  if (!filtersStoreRef.current) {
    filtersStoreRef.current = createFiltersStore({
      initialFilters,
      filtersOptions,
      keepOtherQueryParams,
      localStorageKey,
      persistDebounce,
    });
  }

  return (
    <FiltersContext.Provider value={filtersStoreRef.current}>
      {children}
    </FiltersContext.Provider>
  );
}

function useFiltersStoreApi(): FiltersStoreApi {
  const store = useContext(FiltersContext);

  if (!store) throw new Error("Missing FiltersProvider in the tree");

  return store;
}

/**
 * This hook is used to access the filters store, and the update methods.
 * @returns The store object with a proxy to to only re-render when the used keys change.
 */
export function useFilters(): Mutate<FiltersStoreApi, []> {
  const store = useFiltersStoreApi();

  return useProxyStore(store, shallow);
}

export function useFilter<V extends FilterValue = string>(
  filterKey: FilterKey,
): [V, (value: V) => void] {
  const store = useFiltersStoreApi();

  useLayoutEffect(() => {
    if (!(filterKey in store.getState().filters))
      throw new Error(
        `The "${filterKey.toString()}" key must be defined in the initialValues!`,
      );
  }, [filterKey, store]);

  useEffect(() => {
    store.getState()._subscribeUrlFiltersKey(filterKey);

    return () => {
      store.getState()._unSubscribeUrlFiltersKey(filterKey);
    };
  }, [filterKey, store]);

  const selector = useCallback(
    (state: FiltersStore) => state.filters[filterKey],
    [filterKey],
  );

  const handleFilterChange = useCallback(
    (value: V) => {
      store.getState().setFilter(filterKey, value);
    },
    [filterKey, store],
  );

  const filterValue = useStoreWithEqualityFn(store, selector, shallow) as V;

  return [filterValue, handleFilterChange];
}
