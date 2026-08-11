import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PublicWallGuidelinesModal } from '@/components/shared/OnboardingRule';

describe('PublicWallGuidelinesModal', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Use fake timers to control the 600ms delay
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('does not show the modal immediately on first visit', () => {
    render(<PublicWallGuidelinesModal />);
    expect(screen.queryByText(/Before you post/i)).not.toBeInTheDocument();
  });

  it('shows the modal after a 600ms delay on the first visit', () => {
    render(<PublicWallGuidelinesModal />);
    
    // Fast-forward time by 600ms
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    expect(screen.getByText(/Before you post/i)).toBeInTheDocument();
    expect(screen.getByText(/I understand — let's create/i)).toBeInTheDocument();
  });

  it('does not show the modal if the user has already accepted the guidelines', () => {
    localStorage.setItem('public_wall_guidelines', 'accepted');
    render(<PublicWallGuidelinesModal />);
    
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    expect(screen.queryByText(/Before you post/i)).not.toBeInTheDocument();
  });

  it('hides the modal and sets localStorage when accepted', async () => {
    const onAcceptedMock = jest.fn();
    render(<PublicWallGuidelinesModal onAccepted={onAcceptedMock} />);
    
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    const button = screen.getByText(/I understand — let's create/i);
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    
    expect(localStorage.getItem('public_wall_guidelines')).toBe('accepted');
    expect(onAcceptedMock).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(screen.queryByText(/Before you post/i)).not.toBeInTheDocument();
    });
  });
});
