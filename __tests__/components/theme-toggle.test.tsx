import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
  const setThemeMock = jest.fn();

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('calls setTheme with "dark" when clicked in light mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    
    fireEvent.click(button);
    
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when clicked in dark mode', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: setThemeMock,
    });
    
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    
    fireEvent.click(button);
    
    expect(setThemeMock).toHaveBeenCalledWith('light');
  });
});
