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
