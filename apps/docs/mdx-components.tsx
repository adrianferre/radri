import type { MDXComponents } from "mdx/types";
import { Code } from "@radri/ui/docs";
import { twMerge } from "tailwind-merge";

// This file allows you to provide custom React components
// to be used in MDX files (Docs files). You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: ({ className, children }) => (
      <h1 className={twMerge(className, "text-5xl font-fira-code font-medium")}>
        {children}
      </h1>
    ),
    h2: ({ className, children }) => (
      <h1 className={twMerge(className, "text-3xl font-fira-code")}>
        {children}
      </h1>
    ),
    ol: ({ children, className, ...otherProps }) => (
      <ol {...otherProps} className={twMerge(className, "pl-12 list-decimal")}>
        {children}
      </ol>
    ),
    code: ({ className, children, ...otherProps }) => (
      <Code
        language={
          /language-(?<language>\w+)/.exec(className ?? "")?.groups?.language ??
          "plaintext"
        }
        {...otherProps}
      >
        {children?.toString().trim() ?? ""}
      </Code>
    ),
    ...components,
  };
}
