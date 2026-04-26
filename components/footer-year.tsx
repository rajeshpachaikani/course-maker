"use client";

import { useEffect, useState } from "react";

export function FooterYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <span suppressHydrationWarning>{year ?? ""}</span>;
}
