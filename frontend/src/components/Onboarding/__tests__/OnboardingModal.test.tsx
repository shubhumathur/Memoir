import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingModal from '../../Onboarding/OnboardingModal';
import { AuthProvider } from '../../../contexts/AuthContext';
import axios from 'axios';

vi.mock('axios');

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('OnboardingModal', () => {
  beforeEach(() => {
    (axios.post as any).mockResolvedValue({ data: {} });
  });

  it('renders and navigates steps, then finishes', async () => {
    render(
      <Wrapper>
        <OnboardingModal isOpen onClose={() => {}} />
      </Wrapper>
    );

    // Step 0 visible
    expect(screen.getByText(/Basic info/i)).toBeInTheDocument();

    // Next through steps
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    }

    // Finish
    fireEvent.click(screen.getByRole('button', { name: /Finish onboarding/i }));

    expect(axios.post).toHaveBeenCalledWith(
      '/settings/onboarding',
      expect.objectContaining({ onboarding: expect.any(Object) }),
      expect.any(Object)
    );
    expect(axios.post).toHaveBeenCalledWith(
      '/habits/autogenerate',
      expect.objectContaining({ onboarding: expect.any(Object) }),
      expect.any(Object)
    );
  });
});
