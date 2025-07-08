import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock the WebformService
vi.mock('@/services/webformService', () => ({
  WebformService: vi.fn().mockImplementation(() => ({
    submitForm: vi.fn(),
  })),
}))

describe('/api/webform/[webformId]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.DRUPAL_URL = 'https://test-drupal.example.com'
  })

  it('should return 400 when webformId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/webform/submit', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })
    const params = Promise.resolve({ webformId: '' })

    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Webform ID is required')
  })

  it('should return 500 when DRUPAL_URL is not configured', async () => {
    delete process.env.DRUPAL_URL

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/submit', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('DRUPAL_URL environment variable is not configured')
  })

  it('should return 400 when request body is invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/webform/test-form/submit', {
      method: 'POST',
      body: 'invalid json',
    })
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid JSON in request body')
  })

  it('should successfully submit form data', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockSubmitResult = {
      sid: '123',
      uuid: 'abc-def-ghi',
      created: '2023-01-01T00:00:00Z'
    }

    const mockSubmitForm = vi.fn().mockResolvedValue(mockSubmitResult)
    
    vi.mocked(WebformService).mockImplementation(() => ({
      submitForm: mockSubmitForm,
    }) as unknown as InstanceType<typeof WebformService>)

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    }

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockSubmitResult)
    expect(mockSubmitForm).toHaveBeenCalledWith('test-form', formData)
  })

  it('should handle submission errors', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockSubmitForm = vi.fn().mockRejectedValue(new Error('Submission failed'))
    
    vi.mocked(WebformService).mockImplementation(() => ({
      submitForm: mockSubmitForm,
    }) as unknown as InstanceType<typeof WebformService>)

    const formData = {
      name: 'John Doe',
      email: 'invalid-email'
    }

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Submission failed')
  })

  it('should handle non-Error exceptions', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockSubmitForm = vi.fn().mockRejectedValue('Unknown error')
    
    vi.mocked(WebformService).mockImplementation(() => ({
      submitForm: mockSubmitForm,
    }) as unknown as InstanceType<typeof WebformService>)

    const formData = { name: 'Test' }

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to submit form')
  })

  it('should handle complex form data with composite fields', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockSubmitResult = { sid: '456' }
    const mockSubmitForm = vi.fn().mockResolvedValue(mockSubmitResult)
    
    vi.mocked(WebformService).mockImplementation(() => ({
      submitForm: mockSubmitForm,
    }) as unknown as InstanceType<typeof WebformService>)

    const complexFormData = {
      name: {
        first_name: 'John',
        last_name: 'Doe'
      },
      address: {
        address: '123 Main St',
        city: 'Anytown',
        postal_code: '12345'
      },
      email_confirm: {
        email: 'john@example.com',
        email_confirm: 'john@example.com'
      }
    }

    const request = new NextRequest('http://localhost:3000/api/webform/test-form/submit', {
      method: 'POST',
      body: JSON.stringify(complexFormData),
    })
    const params = Promise.resolve({ webformId: 'test-form' })

    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockSubmitForm).toHaveBeenCalledWith('test-form', complexFormData)
  })
})