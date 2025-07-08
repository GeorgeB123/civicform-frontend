import { notFound } from "next/navigation";
import { fetchWebformStructure } from "@/app/actions/webform";
import WebformPageClient from "./WebformPageClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ webformId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { webformId } = await params;
  
  const webformResponse = await fetchWebformStructure(webformId);
  
  if (!webformResponse) {
    return {
      title: "Form Not Found | Civic Form",
    };
  }

  const ogImageUrl = `/api/og/webform/${webformId}`;

  return {
    title: `${webformResponse.webform.title} | Civic Form`,
    description: webformResponse.webform.description || `Submit ${webformResponse.webform.title} form`,
    openGraph: {
      title: `${webformResponse.webform.title} | Civic Form`,
      description: webformResponse.webform.description || `Submit ${webformResponse.webform.title} form`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${webformResponse.webform.title} - Civic Form`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${webformResponse.webform.title} | Civic Form`,
      description: webformResponse.webform.description || `Submit ${webformResponse.webform.title} form`,
      images: [ogImageUrl],
    },
  };
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
