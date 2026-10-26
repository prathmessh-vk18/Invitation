"use client";

import { useState } from "react";
import { Button } from "@/ui";

export function CopyLink({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="md"
      onClick={() =>
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        })
      }
    >
      {copied ? "Copied ✓" : "Copy link"}
    </Button>
  );
}
