import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, mockLMSContext } from '../../../test/test-utils'
import { SuperAdminSidebar } from '../SuperAdminSidebar'

// Mock window.history methods
const mockPushState = vi.fn()
const mockDispatchEvent = vi.fn()

Object.defineProperty(window, 'history', {
  value: { pushState: mockPushState },
  writable: true
})

Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true
})

describe('SuperAdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders essential navigation items', () => {
    renderWithProviders(<SuperAdminSidebar />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays EduNexa branding and Super Admin title', () => {
    renderWithProviders(<SuperAdminSidebar />)
    
    expect(screen.getByText('EduNexa')).toBeInTheDocument()
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
  })

  it('shows user information when sidebar is open', () => {
    renderWithProviders(<SuperAdminSidebar />)
    
    expect(screen.getByText('Test Super Admin')).toBeInTheDocument()
    expect(screen.getByText('Super Administrator')).toBeInTheDocument()
  })

  it('handles navigation clicks correctly', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSidebar />)
    
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toBeInTheDocument()
    await user.click(dashboardLink!)
    
    expect(mockPushState).toHaveBeenCalledWith({}, '', '/dashboard')
    expect(mockDispatchEvent).toHaveBeenCalled()
  })

  it('calls setSidebarOpen when toggle button is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSidebar />)
    
    // Find the toggle button specifically (the one with chevron icon)
    const toggleButton = document.querySelector('button svg[class*="chevron"]')?.closest('button')
    expect(toggleButton).toBeInTheDocument()
    
    await user.click(toggleButton!)
    
    expect(mockLMSContext.setSidebarOpen).toHaveBeenCalledWith(false)
  })

  it('displays crown icons for super admin branding', () => {
    renderWithProviders(<SuperAdminSidebar />)
    
    // Crown icons should be present in the header and user section
    const crownIcons = document.querySelectorAll('svg')
    expect(crownIcons.length).toBeGreaterThan(0)
  })

  it('has proper navigation structure with correct hrefs', () => {
    renderWithProviders(<SuperAdminSidebar />)
    
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    const userManagementLink = screen.getByText('User Management').closest('a')
    const settingsLink = screen.getByText('Settings').closest('a')
    
    expect(dashboardLink).toBeInTheDocument()
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    expect(userManagementLink).toBeInTheDocument()
    expect(userManagementLink).toHaveAttribute('href', '/admin/users')
    expect(settingsLink).toBeInTheDocument()
    expect(settingsLink).toHaveAttribute('href', '/settings')
  })

  it('applies active state styling to current page', () => {
    // Mock current path as dashboard
    Object.defineProperty(window, 'location', {
      value: { pathname: '/dashboard' },
      writable: true
    })
    
    renderWithProviders(<SuperAdminSidebar />)
    
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('bg-purple-50', 'text-purple-600')
  })

  it('displays badge counts only when greater than 0', () => {
    renderWithProviders(<SuperAdminSidebar />)
    
    // No badges should be visible since none are set
    const badges = document.querySelectorAll('.bg-red-500')
    expect(badges.length).toBe(0)
  })
})