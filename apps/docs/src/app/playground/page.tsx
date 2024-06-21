"use client";

import { memo } from "react";
import { FiltersProvider, useFilter } from "@radri/filters";

const SearchFilter = memo(() => {
  const [search, setSearch] = useFilter("search");

  return (
    <div>
      {/* <pre>{JSON.stringify(filters, null, 2)}</pre> */}
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

export default function Page(): JSX.Element {
  return (
    <FiltersProvider
      initialFilters={{
        search: "",
        otherParam: "",
      }}
    >
      <main className="min-h-screen p-24">
        <h1>Playground</h1>
        <SearchFilter />
      </main>
    </FiltersProvider>
  );
}
