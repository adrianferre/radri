# Radri Filters

**@radri/filters** is a package to handle global filters locally in your app by providing the following advantages:

1. It's fast to apply and propagate the changes since de SSO is a JS object, very useful when you want to store search text, coordinates, scree X Y positions, etc.
2. Automatically updates the URL so the users can share it and use the params as initial values, very useful for filters applied in Tables and Dashboards.
3. Keep them in sync with the Local Storage so the users can load previous filters when navigating to a different page and share same filters in different pages.
4. Persist in Local Storage and URL are done by using a debounce, so you don't loose animation frames when the filters change too fast.
5. All the persist behavior is exposed thru configuration so you can easily change and adapt to different part of your application.
6. Typescript support to avoid bugs.

## How to install

```shell
npm i @radri/filters
```

## Basic usage example

```js
"use client";

import { memo, type ReactNode } from "react";
import { FiltersProvider, useFilter, useFilters } from "@radri/filters";
import { animalsTypes, animals } from "./data";

type FiltersType = {
  animalName: string;
  animalType: string;
};

const SearchAnimalNameFilter = memo(() => {
  const [animalName, setAnimalName] = useFilter<FiltersType>("animalName");

  return (
    <div>
      <input
        className="text-black placeholder:text-black/40 border border-blue-600 px-2 text-sm rounded"
        onChange={(e) => {
          setAnimalName(e.target.value);
        }}
        placeholder="Write an animal name"
        value={animalName}
      />
    </div>
  );
});

SearchAnimalNameFilter.displayName = "SearchAnimalNameFilter";

const SelectAnimalTypeFilter = memo(() => {
  const [animalType, setAnimalType] = useFilter<FiltersType>("animalType");

  return (
    <div>
      <select
        className="text-black border border-blue-600 text-sm rounded capitalize"
        onChange={(e) => {
          setAnimalType(e.target.value);
        }}
        value={animalType}
      >
        {animalsTypes.map((type) => (
          <option className="capitalize" key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
});

SelectAnimalTypeFilter.displayName = "SelectAnimalTypeFilter";

const Filters = memo(({ children }: { children: ReactNode }) => (
  <div className="flex gap-2">{children}</div>
));

Filters.displayName = "Filters";

const AnimalsList = memo(() => {
  const { filters } = useFilters<FiltersType>();

  return (
    <div>
      {animals
        .filter(
          ({ type, name }) =>
            type === filters.animalType &&
            (!filters.animalName ||
              name.toUpperCase().includes(filters.animalName.toUpperCase()))
        )
        .map(({ id, type, name }) => (
          <div key={id}>{`${type}: ${name}`}</div>
        ))}
    </div>
  );
});

AnimalsList.displayName = "AnimalsList";

export function BasicUsage(): JSX.Element {
  return (
    <FiltersProvider
      initialFilters={{
        animalName: "",
        animalType: "bear",
      }}
      keepOtherQueryParams={false}
    >
      <div>
        <Filters>
          <SelectAnimalTypeFilter />
          <SearchAnimalNameFilter />
        </Filters>
        <AnimalsList />
      </div>
    </FiltersProvider>
  );
}
```
