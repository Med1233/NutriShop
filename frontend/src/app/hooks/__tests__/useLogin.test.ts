import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockPush = vi.fn();
const mockGet = vi.fn(() => null);

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useSearchParams: vi.fn(() => ({ get: mockGet })),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../i18n/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: vi.fn(),
    dir: 'ltr',
  })),
}));

import { useLogin } from '../useLogin';
import { useAuth } from '../../context/AuthContext';

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockReturnValue(null);
  vi.mocked(useAuth).mockReturnValue({
    login: vi.fn().mockResolvedValue({}),
  } as any);
});

describe('useLogin', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.submitting).toBe(false);
  });

  it('updates email and password', () => {
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.setEmail('a@b.com');
    });
    act(() => {
      result.current.setPassword('pass');
    });
    expect(result.current.email).toBe('a@b.com');
    expect(result.current.password).toBe('pass');
  });

  it('reads error from search params', () => {
    mockGet.mockReturnValue('OAuth failed');
    const { result } = renderHook(() => useLogin());
    expect(result.current.error).toBe('OAuth failed');
  });

  it('handleSubmit navigates on success', async () => {
    const login = vi
      .fn()
      .mockResolvedValue({ user: { id: 1, name: 'Test', role: 'customer' } });
    vi.mocked(useAuth).mockReturnValue({ login } as any);

    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.setEmail('a@b.com');
    });
    act(() => {
      result.current.setPassword('pass');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(login).toHaveBeenCalledWith('a@b.com', 'pass');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('handleSubmit sets error on failure', async () => {
    const login = vi.fn().mockResolvedValue({ error: 'Bad credentials' });
    vi.mocked(useAuth).mockReturnValue({ login } as any);

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.error).toBe('Bad credentials');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('showGoogle is false by default', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.showGoogle).toBe(false);
  });
});
