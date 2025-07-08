import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock the WebformService
vi.mock('@/services/webformService', () => ({
  WebformService: vi.fn().mockImplementation(() => ({
    uploadFiles: vi.fn(),
  })),
}))

// Helper function to create a mock request with formData
function createMockRequest(formDataEntries: [string, unknown][]) {
  const mockFormData = new Map(formDataEntries)
  const request = {
    formData: vi.fn().mockResolvedValue({
      entries: () => mockFormData.entries(),
    }),
  } as unknown as NextRequest
  return request
}

describe('/api/files/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.DRUPAL_URL = 'https://test-drupal.example.com'
  })

  it('should return 500 when DRUPAL_URL is not configured', async () => {
    delete process.env.DRUPAL_URL

    const formData = new FormData()
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/files/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('DRUPAL_URL environment variable is not configured')
  })

  it('should return 400 when no files are provided', async () => {
    const request = createMockRequest([
      ['text', 'some text value']
    ])

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No files provided')
  })

  it('should successfully upload files', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockUploadFiles = vi.fn().mockResolvedValue([
      { id: '1', filename: 'test.txt', url: 'https://example.com/test.txt' }
    ])
    
    vi.mocked(WebformService).mockImplementation(() => ({
      uploadFiles: mockUploadFiles,
    }) as unknown as InstanceType<typeof WebformService>)

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const request = createMockRequest([
      ['file', file]
    ])

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.files).toHaveLength(1)
    expect(mockUploadFiles).toHaveBeenCalledWith([file])
  })

  it('should handle upload errors', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockUploadFiles = vi.fn().mockRejectedValue(new Error('Upload failed'))
    
    vi.mocked(WebformService).mockImplementation(() => ({
      uploadFiles: mockUploadFiles,
    }) as unknown as InstanceType<typeof WebformService>)

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const request = createMockRequest([
      ['file', file]
    ])

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Upload failed')
  })

  it('should handle multiple files', async () => {
    const { WebformService } = await import('@/services/webformService')
    const mockUploadFiles = vi.fn().mockResolvedValue([
      { id: '1', filename: 'test1.txt', url: 'https://example.com/test1.txt' },
      { id: '2', filename: 'test2.txt', url: 'https://example.com/test2.txt' }
    ])
    
    vi.mocked(WebformService).mockImplementation(() => ({
      uploadFiles: mockUploadFiles,
    }) as unknown as InstanceType<typeof WebformService>)

    const file1 = new File(['test content 1'], 'test1.txt', { type: 'text/plain' })
    const file2 = new File(['test content 2'], 'test2.txt', { type: 'text/plain' })
    const request = createMockRequest([
      ['file1', file1],
      ['file2', file2]
    ])

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.files).toHaveLength(2)
    expect(mockUploadFiles).toHaveBeenCalledWith([file1, file2])
  })
})