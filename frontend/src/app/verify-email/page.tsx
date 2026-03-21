'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    apiFetch('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          await refresh();
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams, refresh]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          {t('verification.pageTitle')}
        </h1>

        {status === 'loading' && (
          <p className="text-gray-500">{t('common.loading')}</p>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 text-4xl">✓</div>
            <p className="mb-6 text-green-700">{t('verification.success')}</p>
            <a
              href="/"
              className="inline-block rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
            >
              {t('common.back')}
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="mb-6 text-red-600">{t('verification.failed')}</p>
            <a
              href="/"
              className="inline-block rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-700 hover:bg-gray-300"
            >
              {t('common.back')}
            </a>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
