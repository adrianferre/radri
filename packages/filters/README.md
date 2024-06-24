# Radri Filters

**@radri/filters** is a package to handle global filters locally in your app by providing the following advantages:

1. It's fast to apply and propagate the changes since de SSO is a JS object, very useful when you want to store search text, coordinates, scree X Y positions, etc.
2. Automatically updates the URL so the users can share it and use the params as initial values, very useful for filters applied in Tables and Dashboards.
3. Keep them in sync with the Local Storage so the users can load previous filters when navigating to a different page and share same filters in different pages.
4. Persist in Local Storage and URL are done by using a debounce, so you don't loose animation frames when the filters change too fast.
5. All the persist behavior is exposed thru configuration so you can easily change and adapt to different part of your application.

## How to install

```shell
npm i @radri/filters
```

## Basic usage example

```js
"use client";

import { memo, type ReactNode } from "react";
import { FiltersProvider, useFilter } from "@radri/filters";

const SearchFilter = memo(() => {
  const [search, setSearch] = useFilter("search");

  return (
    <div>
      <input
        className="text-black"
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        value={search}
      />
    </div>
  );
});

SearchFilter.displayName = "SearchFilter";

const Filters = memo(({ children }: { children: ReactNode }) => (
  <div>{children}</div>
));

Filters.displayName = "Filters";

export function BasicUsage(): JSX.Element {
  return (
    <FiltersProvider
      initialFilters={{
        search: "",
        otherParam: "",
      }}
    >
      <div>
        <Filters>
          <SearchFilter />
        </Filters>
      </div>
    </FiltersProvider>
  );
}
```
