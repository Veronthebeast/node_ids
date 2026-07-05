'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { signUp } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const registerSchema = z
  .object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await signUp(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div
          className="rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-950 dark:text-green-400"
          role="status"
        >
          <p className="font-medium">Revisa tu correo para confirmar tu cuenta</p>
          <p className="mt-1 text-xs opacity-80">
            Si no encuentras el correo, revisa tu carpeta de spam
          </p>
        </div>
        <p className="text-sm text-content-muted">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="font-medium text-content hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    );
  }

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

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="tu@correo.com"
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email')}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={isLoading}
        {...register('password')}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        disabled={isLoading}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={isLoading} className="w-full">
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-content-muted">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="font-medium text-content hover:underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
