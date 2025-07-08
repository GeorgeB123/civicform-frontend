import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchWebformStructure } from "@/app/actions/webform";
import WebformPageClient from "./WebformPageClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ webformId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { webformId } = await params;
  
  try {
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
  } catch (error) {
    if (error instanceof Error && error.message === "This form is closed") {
      return {
        title: "Form Closed | Civic Form",
        description: "This form is no longer accepting submissions.",
      };
    }
    
    return {
      title: "Form Not Found | Civic Form",
    };
  }
}

export default async function WebformPage({ params }: Props) {
  const { webformId } = await params;

  if (!webformId) {
    notFound();
  }

  try {
    const webformResponse = await fetchWebformStructure(webformId);

    if (!webformResponse) {
      notFound();
    }

    return (
      <WebformPageClient
        webformId={webformId}
        webformStructure={webformResponse.elements}
        webformTitle={webformResponse.webform.title}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
      />
    );
  } catch (error) {
    if (error instanceof Error && error.message === "This form is closed") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-2xl mx-4">
            <div className="bg-white border border-red-200 rounded-lg p-8 shadow-sm">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-red-800 font-bold text-2xl mb-4">
                This form is closed
              </h2>
              <p className="text-red-600 mb-6">
                This form is no longer accepting submissions. Please contact the administrator if you need assistance.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    // For other errors, show 404
    notFound();
  }
}
