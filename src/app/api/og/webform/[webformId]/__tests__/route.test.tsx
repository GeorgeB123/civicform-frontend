import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

// Mock the webform actions
vi.mock('@/app/actions/webform', () => ({
  fetchWebformStructure: vi.fn(),
}))

// Mock next/og ImageResponse
vi.mock('next/og', () => ({
  ImageResponse: vi.fn().mockImplementation(() => {
    return new Response('mocked-image-response', {
      status: 200,
      headers: { 'Content-Type': 'image/png' }
    })
  })
}))

describe('/api/og/webform/[webformId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 404 when webform is not found', async () => {
    const { fetchWebformStructure } = await import('@/app/actions/webform')
    vi.mocked(fetchWebformStructure).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/og/webform/invalid-form')
    const params = Promise.resolve({ webformId: 'invalid-form' })

    const response = await GET(request, { params })

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('Webform not found')
  })

  it('should generate OG image for valid webform', async () => {
    const { fetchWebformStructure } = await import('@/app/actions/webform')
    const { ImageResponse } = await import('next/og')
    
    const mockWebformResponse = {
      webform: {
        id: 'test-form',
        title: 'Test Form Title',
        description: 'A test form description'
      },
      elements: {
        name: {
          '#type': 'textfield',
          '#title': 'Name'
        }
      }
    }

    vi.mocked(fetchWebformStructure).mockResolvedValue(mockWebformResponse)

    const request = new Request('http://localhost:3000/api/og/webform/test-form')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })

    expect(response.status).toBe(200)
    expect(fetchWebformStructure).toHaveBeenCalledWith('test-form')
    expect(ImageResponse).toHaveBeenCalledWith(
      expect.any(Object),
      {
        width: 1200,
        height: 630,
      }
    )
  })

  it('should use default title when webform title is missing', async () => {
    const { fetchWebformStructure } = await import('@/app/actions/webform')
    const { ImageResponse } = await import('next/og')
    
    const mockWebformResponse = {
      webform: {
        id: 'test-form',
        title: 'Form',
        description: 'A test form description'
      },
      elements: {}
    }

    vi.mocked(fetchWebformStructure).mockResolvedValue(mockWebformResponse)

    const request = new Request('http://localhost:3000/api/og/webform/test-form')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })

    expect(response.status).toBe(200)
    expect(ImageResponse).toHaveBeenCalledWith(
      expect.any(Object),
      {
        width: 1200,
        height: 630,
      }
    )
  })

  it('should handle errors during image generation', async () => {
    const { fetchWebformStructure } = await import('@/app/actions/webform')
    
    vi.mocked(fetchWebformStructure).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/og/webform/test-form')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Error generating image')
  })

  it('should handle webform with empty title', async () => {
    const { fetchWebformStructure } = await import('@/app/actions/webform')
    const { ImageResponse } = await import('next/og')
    
    const mockWebformResponse = {
      webform: {
        id: 'test-form',
        title: '',
        description: 'A test form description'
      },
      elements: {}
    }

    vi.mocked(fetchWebformStructure).mockResolvedValue(mockWebformResponse)

    const request = new Request('http://localhost:3000/api/og/webform/test-form')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })

    expect(response.status).toBe(200)
    expect(ImageResponse).toHaveBeenCalledWith(
      expect.any(Object),
      {
        width: 1200,
        height: 630,
      }
    )
  })

  it('should handle long webform titles', async () => {
    const { fetchWebformStructure } = await import('@/app/actions/webform')
    const { ImageResponse } = await import('next/og')
    
    const mockWebformResponse = {
      webform: {
        id: 'test-form',
        title: 'This is a very long webform title that should be handled properly in the OG image generation',
        description: 'A test form description'
      },
      elements: {}
    }

    vi.mocked(fetchWebformStructure).mockResolvedValue(mockWebformResponse)

    const request = new Request('http://localhost:3000/api/og/webform/test-form')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })

    expect(response.status).toBe(200)
    expect(ImageResponse).toHaveBeenCalledWith(
      expect.any(Object),
      {
        width: 1200,
        height: 630,
      }
    )
  })
})