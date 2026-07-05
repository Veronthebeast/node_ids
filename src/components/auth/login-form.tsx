'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await login(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400"
          role="status"
        >
          Sesión iniciada correctamente. Redirigiendo...
        </div>
      )}

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="tu@correo.com"
        error={errors.email?.message}
        disabled={isLoading || success}
        {...register('email')}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={isLoading || success}
        {...register('password')}
      />

      <div className="flex items-center justify-end">
        <a
          href="/forgot-password"
          className="text-sm text-content-muted hover:text-content transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button type="submit" loading={isLoading} disabled={success} className="w-full">
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-content-muted">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="font-medium text-content hover:underline">
          Regístrate
        </a>
      </p>
    </form>
  );
}
