"use client";

import { type ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

type LayoutProps = {
  children?: ReactNode;
  defaultLayout: number[] | undefined;
};

export function Layout({
  defaultLayout = [33, 67],
  children,
}: LayoutProps): JSX.Element {
  const onLayout = (sizes: number[]): void => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };

  return (
    <PanelGroup direction="horizontal" onLayout={onLayout}>
      <Panel defaultSize={defaultLayout[0]}>{/* ... */}</Panel>
      <PanelResizeHandle className="w-2 bg-blue-800" />
      <Panel defaultSize={defaultLayout[1]}>{children}</Panel>
    </PanelGroup>
  );
}
