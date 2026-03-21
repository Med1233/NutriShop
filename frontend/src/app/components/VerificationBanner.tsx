'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function VerificationBanner() {
  const { user, resendVerification } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );

  if (!user || user.email_verified || user.provider === 'google') return null;

  const handleResend = async () => {
    setStatus('sending');
    const result = await resendVerification();
    setStatus(result.error ? 'error' : 'sent');
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
      <span>{t('verification.banner')}</span>
      {status === 'sent' ? (
        <span className="ml-2 font-medium text-green-700">
          {t('verification.resendSuccess')}
        </span>
      ) : status === 'error' ? (
        <span className="ml-2 font-medium text-red-600">
          {t('verification.resendError')}
        </span>
      ) : (
        <button
          onClick={handleResend}
          disabled={status === 'sending'}
          className="ml-2 font-medium text-amber-900 underline hover:text-amber-700 disabled:opacity-50"
        >
          {status === 'sending' ? '...' : t('verification.resend')}
        </button>
      )}
    </div>
  );
}
