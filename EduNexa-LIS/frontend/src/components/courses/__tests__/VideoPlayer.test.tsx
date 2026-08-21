import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoPlayer } from '../VideoPlayer';

// Mock fetch globally
global.fetch = vi.fn();

describe('VideoPlayer', () => {
  const mockProps = {
    videoId: 'test-video-id',
    title: 'Test Video',
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === 'access_token' || key === 'token') {
        return 'mock-token';
      }
      return null;
    });
  });

  it('should render video player with title', () => {
    // Mock successful HEAD request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<VideoPlayer {...mockProps} />);
    
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    // Mock successful HEAD request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<VideoPlayer {...mockProps} />);
    
    expect(screen.getByText('Loading video...')).toBeInTheDocument();
  });

  it('should display error when authentication token is missing', async () => {
    // Mock no token
    Storage.prototype.getItem = vi.fn(() => null);

    render(<VideoPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication required. Please log in again.')).toBeInTheDocument();
    });
  });

  it('should display error when video is not found (404)', async () => {
    // Mock 404 response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<VideoPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Video not found/)).toBeInTheDocument();
    });
  });

  it('should display error when user is not authorized (403)', async () => {
    // Mock 403 response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    render(<VideoPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/You do not have permission/)).toBeInTheDocument();
    });
  });

  it('should display error when session has expired (401)', async () => {
    // Mock 401 response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<VideoPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Your session has expired/)).toBeInTheDocument();
    });
  });

  it('should render video element with correct src URL', async () => {
    // Mock successful HEAD request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<VideoPlayer {...mockProps} />);
    
    await waitFor(() => {
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement?.src).toContain('/api/videos/test-video-id/stream');
      expect(videoElement?.src).toContain('token=mock-token');
    });
  });

  it('should have video controls enabled', async () => {
    // Mock successful HEAD request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<VideoPlayer {...mockProps} />);
    
    await waitFor(() => {
      const videoElement = document.querySelector('video');
      expect(videoElement).toHaveAttribute('controls');
    });
  });

  it('should display retry button when error occurs', async () => {
    // Mock 404 response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<VideoPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
});
