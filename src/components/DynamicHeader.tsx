"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function DynamicHeader() {
  const pathname = usePathname();
  const isFormPage = pathname.startsWith("/form/");

  return (
    <Header
      title="Submit a Report"
      backLink={isFormPage ? "/" : undefined}
      backLinkText={isFormPage ? "Home" : undefined}
    />
  );
}
