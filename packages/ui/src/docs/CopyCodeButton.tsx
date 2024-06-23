import { useCopyToClipboard } from "react-use";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";

type CopyCodeButtonProps = {
  code: string;
};

export function CopyCodeButton({ code }: CopyCodeButtonProps): JSX.Element {
  const [justCopied, setJustCopied] = useState(false);

  const [_, copyToClipboard] = useCopyToClipboard();

  useEffect(() => {
    if (justCopied) {
      const current = setTimeout(() => {
        setJustCopied(false);
      }, 2000);

      return () => {
        clearTimeout(current);
      };
    }
  }, [justCopied]);

  const handleCopyCode = useCallback(() => {
    copyToClipboard(code);
    setJustCopied(true);
  }, [code, copyToClipboard]);

  return (
    <button className="ui-flex ui-gap-2" onClick={handleCopyCode} type="button">
      {justCopied ? (
        <>
          <span className="ui-text-xs ui-font-normal ui-font-mono">
            Copied!
          </span>
          <FontAwesomeIcon className="ui-text-green-500" icon={faCheck} />
        </>
      ) : (
        <>
          <span className="ui-text-xs ui-font-normal">Copy code</span>
          <FontAwesomeIcon icon={faCopy} />{" "}
        </>
      )}
    </button>
  );
}
