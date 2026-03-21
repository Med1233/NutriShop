'use client';

import { useLanguage } from '../i18n/LanguageContext';
import { useRegister } from '../hooks';
import Link from 'next/link';
import { Button, Input, FormField, Alert, Card } from '@nutrishop/ui';

export default function RegisterPage() {
  const { t } = useLanguage();
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    submitting,
    handleSubmit,
  } = useRegister();

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-[400px] p-8">
        <h1 className="m-0 mb-6 text-center text-2xl">{t('register.title')}</h1>

        {error && <Alert>{error}</Alert>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label={t('register.name')} htmlFor="name">
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t('register.namePlaceholder')}
            />
          </FormField>
          <FormField label={t('register.email')} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('register.emailPlaceholder')}
            />
          </FormField>
          <FormField label={t('register.password')} htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder={t('register.passwordPlaceholder')}
            />
          </FormField>
          <FormField
            label={t('register.confirmPassword')}
            htmlFor="confirmPassword"
          >
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t('register.confirmPlaceholder')}
            />
          </FormField>
          <Button
            type="submit"
            disabled={submitting}
            variant="secondary"
            size="md"
            className="w-full"
          >
            {submitting ? t('register.submitting') : t('register.submit')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('register.hasAccount')}{' '}
          <Link href="/login" className="text-blue-600 no-underline">
            {t('register.signIn')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
