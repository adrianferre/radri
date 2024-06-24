"use client";

import {
  get as _get,
  set as _set,
  omit as _omit,
  pick as _pick,
  isString as _isString,
  isArray as _isArray,
  debounce as _debounce,
} from "lodash-es";
import type { ParsedQs } from "qs";
import { createStore, type StoreApi, type Mutate } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Filters,
  FilterKey,
  FilterValue,
  FiltersOptions,
  FiltersProviderProps,
} from "./FiltersProvider";

type NonNullableProperties<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

type FiltersStoreState = {
  filters: Filters;
  _subscribedFiltersKeysToQuery: (keyof Filters)[];
};

type FiltersStoreAction = {
  setFilter: (filterKey: FilterKey, value: FilterValue) => void;
  setFilters: (filters: Filters) => void;
  resetFilter: (filterKey: FilterKey) => void;
  resetFilters: () => void;
  _subscribeFiltersKeyToQuery: (key: keyof Filters) => void;
  _unSubscribeFiltersKeyToQuery: (key: keyof Filters) => void;
};

export type FiltersStore = Mutate<FiltersStoreState & FiltersStoreAction, []>;
export type FiltersStoreApi = StoreApi<FiltersStore>;

type PersistentStorage = {
  initialFilters: Filters;
  filtersOptions: FiltersOptions;
  options: {
    keepOtherQueryParams: boolean;
    persistDebounce: number;
    getQueryFilters: () => ParsedQs;
    setQueryFilters: (filters: Filters) => void;
  };
};

const persistentStorage = ({
  initialFilters,
  filtersOptions,
  options: {
    keepOtherQueryParams,
    persistDebounce,
    getQueryFilters,
    setQueryFilters,
  },
}: PersistentStorage): PersistStorage<FiltersStoreState> => ({
  getItem: (localStorageKey) => {
    const queryFilters = getQueryFilters();

    try {
      const localStorageFilters =
        typeof localStorage !== "undefined"
          ? (JSON.parse(
              localStorage.getItem(localStorageKey) ?? "{}"
            ) as Filters)
          : ({} as Filters);

      const mergedFilters = Object.keys(initialFilters).reduce<Filters>(
        (acc, key) => {
          const queryFilterValue = queryFilters[key];
          const localStorageFilterValue = localStorageFilters[key];
          const filterOptions = {
            getInitialValueFromQuery: true,
            getInitialValueFromLocalStorage: true,
            ...filtersOptions[key],
          };

          if (
            filterOptions.getInitialValueFromQuery &&
            queryFilterValue !== undefined
          ) {
            acc[key] = queryFilterValue;
          } else if (
            filterOptions.getInitialValueFromLocalStorage &&
            localStorageFilterValue !== undefined
          ) {
            acc[key] = localStorageFilterValue;
          } else {
            acc[key] = initialFilters[key];
          }

          return acc;
        },
        {}
      );

      return {
        state: {
          filters: mergedFilters,
          _subscribedFiltersKeysToQuery: [],
        },
      };
    } catch (e) {
      return null;
    }
  },
  // The debounce is to avoid setting the localStorage and the location.search too often
  setItem: _debounce(
    (localStorageKey: string, newState: StorageValue<FiltersStoreState>) => {
      const { localStorageFilters, newQueryFilters } = Object.keys(
        initialFilters
      ).reduce<{
        localStorageFilters: Filters;
        newQueryFilters: Filters;
      }>(
        (acc, key) => {
          const filterOptions = {
            setValueToQuery: true,
            setValueToLocalStorage: true,
            ...filtersOptions[key],
          };

          if (filterOptions.setValueToLocalStorage) {
            acc.localStorageFilters[key] = newState.state.filters[key];
          }

          if (
            filterOptions.setValueToQuery &&
            newState.state._subscribedFiltersKeysToQuery.includes(key)
          ) {
            acc.newQueryFilters[key] = newState.state.filters[key];
          }

          return acc;
        },
        {
          localStorageFilters: {},
          newQueryFilters: {},
        }
      );

      if (
        typeof localStorage !== "undefined" &&
        Object.keys(localStorageFilters).length
      ) {
        try {
          // We only want to save in the LS the filters that are in the initialFilters, to not add the garbage from the query params.
          const filters = JSON.stringify(localStorageFilters);
          localStorage.setItem(localStorageKey, filters);
        } catch (e) {
          // eslint-disable-next-line no-console -- We want to log the error in the console but we don't want to throw an error because it's not critical.
          console.error("Error: setItem", e);
        }
      }

      const queryFilters = keepOtherQueryParams ? getQueryFilters() : {};

      setQueryFilters({
        ...queryFilters,
        ...newQueryFilters,
      });
    },
    persistDebounce
  ),
  removeItem: (localStorageKey) => {
    try {
      localStorage.removeItem(localStorageKey);
    } catch (e) {
      // eslint-disable-next-line no-console -- We want to log the error in the console but we don't want to throw an error because it's not critical.
      console.error("Error: removeItem", e);
    }
  },
});

export const createFiltersStore = ({
  initialFilters,
  filtersOptions,
  keepOtherQueryParams,
  localStorageKey,
  persistDebounce,
  getQueryFilters,
  setQueryFilters,
}: NonNullableProperties<
  Omit<NonNullable<FiltersProviderProps>, "children">
>): FiltersStoreApi =>
  createStore<FiltersStore>()(
    persist(
      immer((set) => ({
        // Public methods
        filters: initialFilters,
        setFilter: (filterKey, value) => {
          set((draftState) => {
            if (!(filterKey in draftState.filters)) {
              // eslint-disable-next-line no-console -- We want to log the warning in the console but we don't want to throw an error because it's not critical.
              console.warn(
                `The "${filterKey.toString()}" key you are trying to update is not be defined in the initialValues, so it is skipped.`
              );
            } else {
              _set(draftState.filters, filterKey, value);
            }
          });
        },
        setFilters: (filters) => {
          set((draftState) => {
            Object.entries(filters).forEach(([filterKey, value]) => {
              if (!(filterKey in draftState.filters)) {
                // eslint-disable-next-line no-console -- We want to log the warning in the console but we don't want to throw an error because it's not critical.
                console.warn(
                  `The "${filterKey.toString()}" key you are trying to update is not be defined in the initialValues, so it is skipped.`
                );
              } else {
                _set(draftState.filters, filterKey, value);
              }
            });

            return draftState;
          });
        },
        resetFilter: (filterKey) => {
          set((draftState) => {
            if (!(filterKey in draftState.filters)) {
              // eslint-disable-next-line no-console -- We want to log the warning in the console but we don't want to throw an error because it's not critical.
              console.warn(
                `The "${filterKey.toString()}" key you are trying to reset is not be defined in the initialValues, so it is skipped.`
              );
            } else {
              _set(
                draftState.filters,
                filterKey,
                _get(initialFilters, filterKey)
              );
            }

            return draftState;
          });
        },
        resetFilters: () => {
          set((draftState) => {
            draftState.filters = initialFilters;
          });
        },
        // Private methods
        _subscribedFiltersKeysToQuery: [] as (keyof Filters)[],
        _subscribeFiltersKeyToQuery: (key) => {
          set((draftState) => {
            if (!draftState._subscribedFiltersKeysToQuery.includes(key)) {
              draftState._subscribedFiltersKeysToQuery.push(key);
            }
          });
        },
        _unSubscribeFiltersKeyToQuery: (key) => {
          set((draftState) => {
            const index = draftState._subscribedFiltersKeysToQuery.indexOf(key);
            if (index !== -1) {
              draftState._subscribedFiltersKeysToQuery.splice(index, 1);
            }
          });
        },
      })),
      {
        name: localStorageKey,
        storage: persistentStorage({
          initialFilters,
          filtersOptions,
          options: {
            keepOtherQueryParams,
            persistDebounce,
            getQueryFilters,
            setQueryFilters,
          },
        }),
      }
    )
  );
