import { ImageResponse } from 'next/og';
import { fetchWebformStructure } from '@/app/actions/webform';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ webformId: string }> }
) {
  try {
    const { webformId } = await params;
    
    const webformResponse = await fetchWebformStructure(webformId);
    
    if (!webformResponse) {
      return new Response('Webform not found', { status: 404 });
    }

    const title = webformResponse.title || 'Form';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#172b42',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 500,
              color: 'white',
              lineHeight: 1.2,
              maxWidth: '100%',
              wordWrap: 'break-word',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 400,
              color: 'white',
              marginTop: 'auto',
            }}
          >
            Civic Form
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}