"use client";

import { useState } from "react";
import { Accordion, FilterPills, Tabs } from "@/ui";

export function FilterDemo() {
  const options = ["All", "Hindu", "Muslim", "Sikh", "South Indian"] as const;
  const [v, setV] = useState<(typeof options)[number]>("All");
  return <FilterPills options={options} value={v} onChange={setV} />;
}

export function TabsDemo() {
  const [v, setV] = useState<"latest" | "loved">("latest");
  return (
    <Tabs
      options={[
        { id: "latest", label: "Latest" },
        { id: "loved", label: "Most loved" },
      ]}
      value={v}
      onChange={setV}
      aside="6 designs"
    />
  );
}

export function AccordionDemo() {
  return (
    <Accordion
      items={[
        { q: "How do guests open it?", a: "It's a normal link. It opens in the phone's browser in seconds, with no app or login." },
        { q: "What if a venue changes?", a: "We update the same link, so nobody needs a new invite." },
      ]}
    />
  );
}
