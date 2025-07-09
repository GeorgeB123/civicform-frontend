import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock the WebformService
vi.mock('@/services/webformService', () => ({
  WebformService: vi.fn().mockImplementation(() => ({
    fetchFormStructure: vi.fn(),
  })),
}))

describe('/api/webform/[webformId]/structure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.DRUPAL_URL = 'https://test-drupal.example.com'
  })

  it('should return 400 when webformId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/webform/structure')
    const params = Promise.resolve({ webformId: '' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Webform ID is required')
  })

  it('should return 500 when DRUPAL_URL is not configured', async () => {
    delete process.env.DRUPAL_URL

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/structure')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('DRUPAL_URL environment variable is not configured')
  })

  it('should successfully fetch webform structure', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockStructure = {
      webform: {
        id: 'test-form',
        title: 'Test Form',
        description: 'A test form'
      },
      elements: {
        name: {
          '#type': 'textfield',
          '#title': 'Name',
          '#required': true
        },
        email: {
          '#type': 'email',
          '#title': 'Email',
          '#required': true
        }
      }
    }

    const mockFetchFormStructure = vi.fn().mockResolvedValue(mockStructure)
    
    vi.mocked(WebformService).mockImplementation(() => ({
      fetchFormStructure: mockFetchFormStructure,
    }) as unknown as InstanceType<typeof WebformService>)

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/structure')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockStructure)
    expect(mockFetchFormStructure).toHaveBeenCalledWith('test-form')
  })

  it('should handle fetch errors', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockFetchFormStructure = vi.fn().mockRejectedValue(new Error('Form not found'))
    
    vi.mocked(WebformService).mockImplementation(() => ({
      fetchFormStructure: mockFetchFormStructure,
    }) as unknown as InstanceType<typeof WebformService>)

    const request = new NextRequest('http://localhost:3000/api/webform/invalid-form/structure')
    const params = Promise.resolve({ webformId: 'invalid-form' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Form not found')
  })

  it('should handle closed form status', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockFetchFormStructure = vi.fn().mockRejectedValue(new Error('This form is closed'))
    
    vi.mocked(WebformService).mockImplementation(() => ({
      fetchFormStructure: mockFetchFormStructure,
    }) as unknown as InstanceType<typeof WebformService>)

    const request = new NextRequest('http://localhost:3000/api/webform/closed-form/structure')
    const params = Promise.resolve({ webformId: 'closed-form' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('This form is closed')
  })

  it('should handle non-Error exceptions', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockFetchFormStructure = vi.fn().mockRejectedValue('Unknown error')
    
    vi.mocked(WebformService).mockImplementation(() => ({
      fetchFormStructure: mockFetchFormStructure,
    }) as unknown as InstanceType<typeof WebformService>)

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/structure')
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch form structure')
  })
})