"use client";

import { memo } from "react";
import { FiltersProvider, useFilters } from "@repo/filters-provider";

const SearchFilter = memo(() => {
  const { filters, setFilter } = useFilters();

  return (
    <div>
      <pre>{JSON.stringify(filters, null, 2)}</pre>
      <input
        className="text-black"
        onChange={(e) => setFilter("search", e.target.value)}
        value={filters.search}
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
      }}
    >
      <main className="min-h-screen p-24">
        <h1>Playground</h1>
        <SearchFilter />
      </main>
    </FiltersProvider>
  );
}
