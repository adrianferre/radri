"use client";

import dynamic from "next/dynamic";

const FiltersDocs = dynamic(() => import("./filters-docs.mdx"), { ssr: false });

export default function FiltersPage(): JSX.Element {
  return <FiltersDocs />;
}
