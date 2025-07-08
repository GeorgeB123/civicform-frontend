import { notFound } from "next/navigation";
import { fetchWebformStructure } from "@/app/actions/webform";
import WebformPageClient from "./WebformPageClient";

interface Props {
  params: Promise<{ webformId: string }>;
}

export default async function WebformPage({ params }: Props) {
  const { webformId } = await params;

  if (!webformId) {
    notFound();
  }

  const webformResponse = await fetchWebformStructure(webformId);

  if (!webformResponse) {
    notFound();
  }

  return (
    <WebformPageClient
      webformId={webformId}
      webformStructure={webformResponse.elements}
      webformTitle={webformResponse.webform.title}
    />
  );
}
