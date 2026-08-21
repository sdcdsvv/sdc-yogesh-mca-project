import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/test-utils'
import { SuperAdminDashboard } from '../SuperAdminDashboard'

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

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays welcome message with user name', () => {
    renderWithProviders(<SuperAdminDashboard />)
    
    expect(screen.getByText(/Test Super Admin/)).toBeInTheDocument()
    expect(screen.getByText('System administration dashboard')).toBeInTheDocument()
  })

  it('shows essential statistics cards', () => {
    renderWithProviders(<SuperAdminDashboard />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getAllByText('System Status')).toHaveLength(2) // One in stats, one in quick actions
    expect(screen.getByText('Active Users')).toBeInTheDocument()
  })

  it('displays correct stat values', () => {
    renderWithProviders(<SuperAdminDashboard />)
    
    expect(screen.getByText('1,247')).toBeInTheDocument()
    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.getByText('892')).toBeInTheDocument()
  })

  it('shows quick actions section', () => {
    renderWithProviders(<SuperAdminDashboard />)
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getAllByText('System Status')).toHaveLength(2) // One in stats, one in quick actions
  })

  it('handles quick action navigation', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminDashboard />)
    
    const userManagementButton = screen.getByText('User Management').closest('button')
    await user.click(userManagementButton!)
    
    expect(mockPushState).toHaveBeenCalledWith({}, '', '/admin/users')
    expect(mockDispatchEvent).toHaveBeenCalled()
  })

  it('handles settings navigation', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminDashboard />)
    
    const settingsButton = screen.getByText('Settings').closest('button')
    await user.click(settingsButton!)
    
    expect(mockPushState).toHaveBeenCalledWith({}, '', '/settings')
    expect(mockDispatchEvent).toHaveBeenCalled()
  })

  it('displays crown icons for super admin branding', () => {
    renderWithProviders(<SuperAdminDashboard />)
    
    // Crown icons should be present in the welcome section
    const crownIcons = document.querySelectorAll('svg')
    expect(crownIcons.length).toBeGreaterThan(0)
  })

  it('shows appropriate greeting based on time', () => {
    renderWithProviders(<SuperAdminDashboard />)
    
    // Should show one of the greetings
    const greetings = ['Good morning', 'Good afternoon', 'Good evening']
    const hasGreeting = greetings.some(greeting => 
      screen.queryByText(new RegExp(greeting)) !== null
    )
    expect(hasGreeting).toBe(true)
  })

  it('displays stat change information', () => {
    renderWithProviders(<SuperAdminDashboard />)
    
    expect(screen.getAllByText('+12% this month')).toHaveLength(2) // Responsive design shows it twice
    expect(screen.getAllByText('99.9% uptime')).toHaveLength(2) // Responsive design shows it twice
    expect(screen.getAllByText('Currently online')).toHaveLength(2) // Responsive design shows it twice
  })
})