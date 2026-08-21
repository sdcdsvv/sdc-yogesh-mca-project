import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock user data for testing
export const mockSuperAdminUser = {
  _id: 'test-super-admin-id',
  name: 'Test Super Admin',
  email: 'superadmin@test.com',
  role: 'super_admin' as const,
  department: 'System Administration',
  employee_id: 'SA-001',
  phone: '+1234567890',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z'
}

// Mock AuthContext
const mockAuthContext = {
  user: mockSuperAdminUser,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  googleLogin: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  logoutAll: vi.fn(),
  refreshUser: vi.fn(),
  checkTokenValidity: vi.fn()
}

// Mock LMSContext
const mockLMSContext = {
  courses: [],
  assignments: [],
  announcements: [],
  sidebarOpen: true,
  setSidebarOpen: vi.fn(),
  selectedCourse: null,
  setSelectedCourse: vi.fn()
}

// Mock the context hooks
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('../contexts/LMSContext', () => ({
  useLMS: () => mockLMSContext,
  LMSProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock providers for custom render
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any
  sidebarOpen?: boolean
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { ...renderOptions } = options

  return render(ui, { wrapper: MockProviders, ...renderOptions })
}

// Export mock contexts for test customization
export { mockAuthContext, mockLMSContext }

// Re-export everything from testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'