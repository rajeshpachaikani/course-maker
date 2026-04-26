import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
