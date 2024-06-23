import MonacoReact, { loader, type OnMount } from "@monaco-editor/react";
import { useState, useCallback } from "react";
import { CopyCodeButton } from "./CopyCodeButton";

loader
  .init()
  .then((monaco) => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowNonTsExtensions: true,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowNonTsExtensions: true,
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console -- We want to log the error in the console but we don't want to throw an error because it's not critical.
    console.log("Error", error);
  });

const MARKDOWN_TO_MONACO = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  default: "plaintext",
};

type CodeProps = {
  className?: string;
  language: string;
  children: string;
};

export function Code({
  className,
  children,
  language,
}: CodeProps): JSX.Element {
  const [height, setHeight] = useState(500);
  // const mdxLanguage = /language-(?<lang>\w+)/.exec(className ?? "")?.groups
  //   ?.lang as keyof typeof MARKDOWN_TO_MONACO | undefined;

  // const language: string =
  //   mdxLanguage && mdxLanguage in MARKDOWN_TO_MONACO
  //     ? MARKDOWN_TO_MONACO[mdxLanguage]
  //     : MARKDOWN_TO_MONACO.default;

  const handleEditorMount = useCallback((editor: Parameters<OnMount>[0]) => {
    setHeight(editor.getContentHeight());

    editor.onDidChangeModel(() => {
      setHeight(editor.getContentHeight());
    });

    editor.onDidLayoutChange(() => {
      setHeight(editor.getContentHeight());
    });
  }, []);

  return (
    <div className="ui-shadow ui-rounded-lg ui-overflow-hidden">
      <div className="ui-h-10 ui-bg-black ui-text-white ui-flex ui-items-center ui-justify-end ui-px-3">
        <CopyCodeButton code={children} />
      </div>
      <MonacoReact
        height={height}
        language={language}
        onMount={handleEditorMount}
        options={{
          automaticLayout: true,
          readOnly: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          wordWrap: "on",
          padding: {
            top: 12,
            bottom: 12,
          },
        }}
        theme="vs-dark"
        value={children}
      />
    </div>
  );
}
