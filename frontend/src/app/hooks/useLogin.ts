import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { translateError } from '../i18n/errorMessages';

export function useLogin() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setError(translateError(err, t));
  }, [searchParams, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(translateError(result.error, t));
    } else {
      router.push('/');
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const showGoogle = !!(
    googleClientId && googleClientId !== 'your-google-client-id'
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    handleSubmit,
    showGoogle,
  };
}
