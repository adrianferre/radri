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
import { stringify, parse } from "qs";
import type {
  ParsedQs,
  IParseOptions,
  IStringifyOptions,
  BooleanOptional,
} from "qs";
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

function getUrlFilters(): ParsedQs {
  if (typeof window !== "undefined") {
    return parse(window.location.search, {
      allowDots: true,
      comma: true,
      ignoreQueryPrefix: true,
    });
  }

  return {};
}

type FiltersStoreState = {
  filters: Filters;
  _subscribedUrlFiltersKeys: (keyof Filters)[];
};

type FiltersStoreAction = {
  setFilter: (filterKey: FilterKey, value: FilterValue) => void;
  setFilters: (filters: Filters) => void;
  resetFilter: (filterKey: FilterKey) => void;
  resetFilters: () => void;
  _subscribeUrlFiltersKey: (key: keyof Filters) => void;
  _unSubscribeUrlFiltersKey: (key: keyof Filters) => void;
};

export type FiltersStore = Mutate<FiltersStoreState & FiltersStoreAction, []>;
export type FiltersStoreApi = StoreApi<FiltersStore>;

type PersistentStorage = {
  initialFilters: Filters;
  filtersOptions: FiltersOptions;
  options?: {
    keepOtherQueryParams?: boolean;
    persistDebounce?: number;
    parseOptions?: IParseOptions<BooleanOptional>;
    stringifyOptions?: IStringifyOptions<BooleanOptional>;
  };
};

const persistentStorage = ({
  initialFilters,
  filtersOptions,
  options: { keepOtherQueryParams, persistDebounce } = {},
}: PersistentStorage): PersistStorage<FiltersStoreState> => ({
  getItem: (localStorageKey) => {
    const urlFilters = getUrlFilters();
    // We only want to keep the filters that are in the initialFilters, but we want to keep other params in the URL like spoof.
    try {
      const localStorageFilters =
        typeof localStorage !== "undefined"
          ? (JSON.parse(
              localStorage.getItem(localStorageKey) ?? "{}",
            ) as Filters)
          : ({} as Filters);

      const mergedFilters = Object.keys(initialFilters).reduce<Filters>(
        (acc, key) => {
          const urlFilterValue = urlFilters[key];
          const localStorageFilterValue = localStorageFilters[key];
          const filterOptions = {
            getInitialValueFromUrl: true,
            getInitialValueFromLocalStorage: true,
            ...filtersOptions[key],
          };

          if (
            filterOptions.getInitialValueFromUrl &&
            urlFilterValue !== undefined
          ) {
            acc[key] = urlFilterValue;
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
        {},
      );

      return {
        state: {
          filters: mergedFilters,
          _subscribedUrlFiltersKeys: [],
        },
      };
    } catch (e) {
      return null;
    }
  },
  // The debounce is to avoid setting the localStorage and the location.search too often
  setItem: _debounce(
    (localStorageKey: string, newState: StorageValue<FiltersStoreState>) => {
      const { localStorageFilters, newUrlFilter } = Object.keys(
        initialFilters,
      ).reduce<{
        localStorageFilters: Filters;
        newUrlFilter: Filters;
      }>(
        (acc, key) => {
          const filterOptions = {
            setValueToUrl: true,
            setValueToLocalStorage: true,
            ...filtersOptions[key],
          };

          if (filterOptions.setValueToLocalStorage) {
            acc.localStorageFilters[key] = newState.state.filters[key];
          }

          if (
            filterOptions.setValueToUrl &&
            newState.state._subscribedUrlFiltersKeys.includes(key)
          ) {
            acc.newUrlFilter[key] = newState.state.filters[key];
          }

          return acc;
        },
        {
          localStorageFilters: {},
          newUrlFilter: {},
        },
      );

      if (
        typeof localStorage !== "undefined" &&
        Object.keys(localStorageFilters).length
      ) {
        try {
          // We only want to save in the LS the filters that are in the initialFilters, to not add the garbage from the URL like spoof.
          const filters = JSON.stringify(localStorageFilters);
          localStorage.setItem(localStorageKey, filters);
        } catch (e) {
          // eslint-disable-next-line no-console -- We want to log the error in the console but we don't want to throw an error because it's not critical.
          console.error("Error: setItem", e);
        }
      }

      if (typeof window !== "undefined") {
        const urlFilters = keepOtherQueryParams ? getUrlFilters() : {};

        const urlFiltersStringified = stringify(
          {
            ...urlFilters,
            ...newUrlFilter,
          },
          {
            encode: false,
            allowDots: true,
            arrayFormat: "comma",
            addQueryPrefix: true,
            filter: (_, value: FilterValue) => {
              if (value === undefined) {
                return;
              }

              if (_isString(value) && value.length === 0) {
                return;
              }

              if (_isArray(value) && value.length === 0) {
                return;
              }

              return value;
            },
          },
        );

        const currentUrl = window.location.href;

        // Remove the search parameters by creating a new URL object
        const newUrl = new URL(currentUrl);

        // Clear the search part of the URL
        newUrl.search = urlFiltersStringified;

        window.history.replaceState(null, "", newUrl);
      }
    },
    persistDebounce,
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
                `The "${filterKey.toString()}" key you are trying to update is not be defined in the initialValues, so it is skipped.`,
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
                  `The "${filterKey.toString()}" key you are trying to update is not be defined in the initialValues, so it is skipped.`,
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
                `The "${filterKey.toString()}" key you are trying to reset is not be defined in the initialValues, so it is skipped.`,
              );
            } else {
              _set(
                draftState.filters,
                filterKey,
                _get(initialFilters, filterKey),
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
        _subscribedUrlFiltersKeys: [] as (keyof Filters)[],
        _subscribeUrlFiltersKey: (key) => {
          set((draftState) => {
            if (!draftState._subscribedUrlFiltersKeys.includes(key)) {
              draftState._subscribedUrlFiltersKeys.push(key);
            }
          });
        },
        _unSubscribeUrlFiltersKey: (key) => {
          set((draftState) => {
            const index = draftState._subscribedUrlFiltersKeys.indexOf(key);
            if (index !== -1) {
              draftState._subscribedUrlFiltersKeys.splice(index, 1);
            }
          });
        },
      })),
      {
        name: localStorageKey,
        storage: persistentStorage({
          initialFilters,
          filtersOptions,
          options: { keepOtherQueryParams, persistDebounce },
        }),
      },
    ),
  );
