import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    register: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../i18n/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

import { useRegister } from '../useRegister';
import { useAuth } from '../../context/AuthContext';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({ register: vi.fn().mockResolvedValue({}) } as any);
});

describe('useRegister', () => {
  it('initializes with empty fields', () => {
    const { result } = renderHook(() => useRegister());
    expect(result.current.name).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.confirmPassword).toBe('');
    expect(result.current.error).toBe('');
  });

  it('sets error on password mismatch', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setPassword('pass1234');
      result.current.setConfirmPassword('different');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.error).toBe('register.passwordsMismatch');
  });

  it('calls register and navigates on success', async () => {
    const register = vi.fn().mockResolvedValue({});
    vi.mocked(useAuth).mockReturnValue({ register } as any);

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setName('User');
      result.current.setEmail('u@e.com');
      result.current.setPassword('pass1234');
      result.current.setConfirmPassword('pass1234');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(register).toHaveBeenCalledWith('u@e.com', 'pass1234', 'User');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('sets error from register failure', async () => {
    const register = vi.fn().mockResolvedValue({ error: 'Email taken' });
    vi.mocked(useAuth).mockReturnValue({ register } as any);

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setPassword('pass1234');
      result.current.setConfirmPassword('pass1234');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.error).toBe('Email taken');
    expect(mockPush).not.toHaveBeenCalled();
  });
});
