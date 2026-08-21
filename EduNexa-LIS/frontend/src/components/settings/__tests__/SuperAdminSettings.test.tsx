import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../../test/test-utils'
import { SuperAdminSettings } from '../SuperAdminSettings'

// Mock console methods
const mockConsoleLog = vi.fn()
const mockConsoleError = vi.fn()
Object.defineProperty(console, 'log', { value: mockConsoleLog })
Object.defineProperty(console, 'error', { value: mockConsoleError })

// Mock window.alert
const mockAlert = vi.fn()
Object.defineProperty(window, 'alert', { value: mockAlert })

describe('SuperAdminSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders settings page with correct title', () => {
    renderWithProviders(<SuperAdminSettings />)
    
    expect(screen.getByText('Super Admin Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your profile and system configuration')).toBeInTheDocument()
  })

  it('displays navigation tabs', () => {
    renderWithProviders(<SuperAdminSettings />)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('shows profile form with user data', () => {
    renderWithProviders(<SuperAdminSettings />)
    
    const nameInput = screen.getByDisplayValue('Test Super Admin')
    const emailInput = screen.getByDisplayValue('superadmin@test.com')
    
    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toBeDisabled()
  })

  it('handles profile form submission', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSettings />)
    
    const nameInput = screen.getByDisplayValue('Test Super Admin')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Admin Name')
    
    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith('Saving profile data:', expect.objectContaining({
        name: 'Updated Admin Name'
      }))
    })
  })

  it('switches to security tab and shows password form', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSettings />)
    
    const securityTab = screen.getByText('Security')
    await user.click(securityTab)
    
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    // Check for password inputs by their type
    const passwordInputs = screen.getAllByDisplayValue('')
    expect(passwordInputs).toHaveLength(3) // Three password inputs
  })

  it('handles password change with validation', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSettings />)
    
    // Switch to security tab
    const securityTab = screen.getByText('Security')
    await user.click(securityTab)
    
    // Fill password form with mismatched passwords
    const passwordInputs = screen.getAllByDisplayValue('')
    const currentPassword = passwordInputs[0]
    const newPassword = passwordInputs[1]
    const confirmPassword = passwordInputs[2]
    
    await user.type(currentPassword, 'oldpassword')
    await user.type(newPassword, 'newpassword')
    await user.type(confirmPassword, 'differentpassword')
    
    const updateButton = screen.getByText('Update Password')
    await user.click(updateButton)
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('New passwords do not match!')
    })
  })

  it('switches to system tab and shows system settings', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSettings />)
    
    const systemTab = screen.getByText('System')
    await user.click(systemTab)
    
    expect(screen.getByText('System Configuration')).toBeInTheDocument()
    expect(screen.getByText('Maintenance Mode')).toBeInTheDocument()
    expect(screen.getByText('Allow User Registration')).toBeInTheDocument()
    expect(screen.getByText('File Upload Settings')).toBeInTheDocument()
  })

  it('handles system settings changes', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSettings />)
    
    // Switch to system tab
    const systemTab = screen.getByText('System')
    await user.click(systemTab)
    
    // Toggle maintenance mode (first checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const maintenanceToggle = checkboxes[0]
    await user.click(maintenanceToggle)
    
    // Save system settings
    const saveButton = screen.getByText('Save System Settings')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith('Saving system settings:', expect.objectContaining({
        maintenanceMode: true
      }))
    })
  })

  it('shows password visibility toggles', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    
    renderWithProviders(<SuperAdminSettings />)
    
    // Switch to security tab
    const securityTab = screen.getByText('Security')
    await user.click(securityTab)
    
    // Check for password visibility toggle buttons
    const toggleButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')
    )
    
    expect(toggleButtons.length).toBeGreaterThan(0)
  })

  it('displays crown icon for super admin branding', () => {
    renderWithProviders(<SuperAdminSettings />)
    
    // Crown icon should be present in the header
    const crownIcons = document.querySelectorAll('svg')
    expect(crownIcons.length).toBeGreaterThan(0)
  })
})