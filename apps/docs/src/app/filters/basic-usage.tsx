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
