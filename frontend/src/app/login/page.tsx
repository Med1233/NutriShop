'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../i18n/LanguageContext';
import { useLogin } from '../hooks';
import { getBackendUrl } from '../api/client';
import Link from 'next/link';
import { Button, Input, FormField, Alert, Card } from '@nutrishop/ui';

function LoginForm() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    handleSubmit,
    showGoogle,
  } = useLogin();

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-[400px] p-8">
        <h1 className="m-0 mb-6 text-center text-2xl">{t('login.title')}</h1>

        {error && <Alert>{error}</Alert>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label={t('login.email')} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('login.emailPlaceholder')}
            />
          </FormField>

          <FormField label={t('login.password')} htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('login.passwordPlaceholder')}
            />
          </FormField>

          <Button
            type="submit"
            disabled={submitting}
            variant="secondary"
            size="md"
            className="w-full"
          >
            {submitting ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>

        {showGoogle && (
          <>
            <div className="my-6 flex items-center gap-2">
              <span className="flex-1 border-t border-gray-200 px-2 text-center text-sm leading-[0.1em] text-gray-400">
                {t('login.or')}
              </span>
            </div>
            <a
              href={`${getBackendUrl()}/api/auth/google`}
              className="flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-700 no-underline"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                style={{ [dir === 'rtl' ? 'marginLeft' : 'marginRight']: 8 }}
              >
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58Z"
                />
              </svg>
              {t('login.google')}
            </a>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('login.noAccount')}{' '}
          <Link
            href={
              redirect
                ? `/register?redirect=${encodeURIComponent(redirect)}`
                : '/register'
            }
            className="text-blue-600 no-underline"
          >
            {t('login.createOne')}
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
