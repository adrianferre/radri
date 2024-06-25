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
import {
  isString as _isString,
  isArray as _isArray,
  isObject as _isObject,
} from "lodash-es";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { parse, stringify } from "qs";
import {
  type CreateFiltersStore,
  type FiltersStoreType,
  type FiltersType,
  createFiltersStore,
} from "./FiltersStore";
import { useProxyStore } from "./useProxyStore";

/**
 * Options for each filter to control how the filter will be handled.
 */
export type FiltersOptions<Filters extends FiltersType> = Partial<
  Record<
    keyof Filters,
    {
      /**
       * If true, the filter key will be initialized with the value from the query if exists.
       * @defaultValue true
       * */
      getInitialValueFromQuery?: boolean;
      /**
       * If true, the filter key will be initialized with the value from the localStorage if exists.
       * @defaultValue true
       * */
      getInitialValueFromLocalStorage?: boolean;
      /**
       * If true, the filter key will be persisted in the query.
       * @defaultValue true
       * */
      setValueToQuery?: boolean;
      /**
       * If true, the filter key will be set in the localStorage.
       * @defaultValue true
       * */
      setValueToLocalStorage?: boolean;
    }
  >
>;

export type FiltersProviderProps<Filters extends FiltersType> = {
  /**
   * Initial filters that will be used to initialize the filters (If no getInitialValueFromQuery or getInitialValueFromLocalStorage is set)
   * or reset them by calling the resetFilter or resetFilters methods.
   * If a value is not present in the initial values it' will be ignored.
   * @defaultValue \{\}
   */
  initialFilters: Filters;
  /**
   * Options for each filter key to control how the filter will be handled.
   * @defaultValue \{
   *  getInitialValueFromQuery: true,
   *  getInitialValueFromLocalStorage: true,
   *  setValueToQuery: true,
   *  setValueToLocalStorage: true
   * \}
   */
  filtersOptions?: FiltersOptions<Filters>;
  /**
   * If true the other query params are going to be keep and merged with the ones specified in the initialValues.
   * @defaultValue true
   * */
  keepOtherQueryParams?: boolean;
  /**
   * The key that will be used to persist the filters in the localStorage.
   * @defaultValue "__DEFAULT_LS_FILTERS_KEY__"
   */
  localStorageKey?: string;
  /**
   * The debounce time in milliseconds for the query and localStorage updates.
   * @defaultValue 300
   */
  persistDebounce?: number;
  /**
   * The children that will have access to the filters.
   * */
  children?: ReactNode | ReactNode[];
  /**
   * With this function you can customize how you are going to retrieve the query params.
   * defaultValue: getQueryFiltersFromUrl
   * */
  getQueryFilters?: () => Partial<Filters>;
  /**
   * With this function you can customize how you are going to update the query params.
   * defaultValue: setQueryFiltersToUrl
   * */
  setQueryFilters?: (filters: Filters) => void;
};

function setQueryFiltersToUrl<Filters extends FiltersType>(
  filters: Filters
): void {
  if (typeof window !== "undefined") {
    const urlFiltersStringified = stringify(filters, {
      addQueryPrefix: true,
      filter: (_, value: unknown) => {
        if (_isString(value) && value.length === 0) {
          return;
        }

        if (_isArray(value) && value.length === 0) {
          return;
        }

        if (_isObject(value) && Object.keys(value).length === 0) {
          return;
        }

        return value;
      },
    });

    const currentUrl = window.location.href;

    // Remove the search parameters by creating a new URL object
    const newUrl = new URL(currentUrl);

    // Clear the search part of the URL
    newUrl.search = urlFiltersStringified;

    window.history.replaceState(null, "", newUrl);
  }
}

function getQueryFiltersFromUrl<
  Filters extends FiltersType,
>(): Partial<Filters> {
  if (typeof window !== "undefined") {
    return parse(window.location.search, {
      ignoreQueryPrefix: true,
    }) as Partial<Filters>;
  }

  return {};
}

export const FiltersContext = createContext<unknown>(null);

FiltersContext.displayName = "FiltersContext";

export function FiltersProvider<Filters extends FiltersType>({
  initialFilters,
  children,
  filtersOptions = {},
  keepOtherQueryParams = true,
  localStorageKey = "__DEFAULT_LS_FILTERS_KEY__",
  persistDebounce = 300,
  getQueryFilters = getQueryFiltersFromUrl<Filters>,
  setQueryFilters = setQueryFiltersToUrl,
}: FiltersProviderProps<Filters>): JSX.Element {
  const filtersStoreRef = useRef<CreateFiltersStore<Filters>>();

  if (!filtersStoreRef.current) {
    filtersStoreRef.current = createFiltersStore({
      initialFilters,
      filtersOptions,
      keepOtherQueryParams,
      localStorageKey,
      persistDebounce,
      getQueryFilters,
      setQueryFilters,
    });
  }

  return (
    <FiltersContext.Provider
      value={filtersStoreRef.current as unknown as CreateFiltersStore<Filters>}
    >
      {children}
    </FiltersContext.Provider>
  );
}

function useFiltersStoreApi<
  Filters extends FiltersType,
>(): CreateFiltersStore<Filters> {
  const store = useContext(FiltersContext);

  if (!store) throw new Error("Missing FiltersProvider in the tree");

  return store as CreateFiltersStore<Filters>;
}

/**
 * This hook is used to access the filters store, and the update methods.
 * @returns The store object with a proxy to to only re-render when the used keys change.
 */
export function useFilters<Filters extends FiltersType>(): {
  [K in keyof FiltersStoreType<Filters>]: FiltersStoreType<Filters>[K];
} {
  const store = useFiltersStoreApi<Filters>();

  return useProxyStore(store);
}

type FilterValue<Filters> = Filters[keyof Filters];

export function useFilter<Filters extends FiltersType>(
  filterKey: string
): [FilterValue<Filters>, (value: FilterValue<Filters>) => void, () => void] {
  const store = useFiltersStoreApi();

  useLayoutEffect(() => {
    if (!(filterKey in store.getState().filters))
      throw new Error(
        `The "${filterKey.toString()}" key must be defined in the initialValues!`
      );
  }, [filterKey, store]);

  useEffect(() => {
    store.getState()._subscribeFiltersKeyToQuery(filterKey);

    return () => {
      store.getState()._unSubscribeFiltersKeyToQuery(filterKey);
    };
  }, [filterKey, store]);

  const selector = useCallback(
    (state: FiltersStoreType<FiltersType>) => state.filters[filterKey],
    [filterKey]
  );

  const handleChangeFilter = useCallback(
    (value: FilterValue<Filters>) => {
      store.getState().setFilter(filterKey, value);
    },
    [filterKey, store]
  );

  const handleResetFilter = useCallback(() => {
    store.getState().resetFilter(filterKey);
  }, [filterKey, store]);

  const filterValue = useStoreWithEqualityFn(
    store,
    selector,
    shallow
  ) as FilterValue<Filters>;

  return [filterValue, handleChangeFilter, handleResetFilter];
}
