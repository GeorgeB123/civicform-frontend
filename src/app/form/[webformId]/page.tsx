import { notFound } from "next/navigation";
import { fetchWebformStructure } from "@/app/actions/webform";
import WebformPageClient from "./WebformPageClient";

interface Props {
  params: { webformId: string };
}

export default async function WebformPage({ params }: Props) {
  const { webformId } = await params;

  if (!webformId) {
    notFound();
  }

  const webformStructure = await fetchWebformStructure(webformId);

  if (!webformStructure) {
    notFound();
  }

  return (
    <WebformPageClient
      webformId={webformId}
      webformStructure={webformStructure}
    />
  );
}
