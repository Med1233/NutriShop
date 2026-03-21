import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export function useRegister() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.passwordsMismatch'));
      return;
    }

    setSubmitting(true);
    const result = await register(email, password, name);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  return {
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
  };
}
