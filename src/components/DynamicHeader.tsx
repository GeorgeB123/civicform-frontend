"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function DynamicHeader() {
  const pathname = usePathname();
  const isFormPage = pathname.startsWith("/form/");
  const isDynamicWebformPage = pathname.match(/^\/form\/[^/]+$/);

  // Don't show header on dynamic webform pages (they have their own header with the form title)
  if (isDynamicWebformPage) {
    return null;
  }

  return (
    <Header
      title="Submit a Report"
      backLink={isFormPage ? "/" : undefined}
      backLinkText={isFormPage ? "Home" : undefined}
    />
  );
}
