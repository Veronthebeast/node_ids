'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { resetPassword } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', data.email);

    const result = await resetPassword(formData);

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
          <p className="font-medium">
            Si el correo está registrado, recibirás un enlace para restablecer tu
            contraseña
          </p>
        </div>
        <p className="text-sm text-content-muted">
          <a href="/login" className="font-medium text-content hover:underline">
            Volver a iniciar sesión
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

      <Button type="submit" loading={isLoading} className="w-full">
        Enviar enlace de recuperación
      </Button>

      <p className="text-center text-sm text-content-muted">
        <a href="/login" className="font-medium text-content hover:underline">
          Volver a iniciar sesión
        </a>
      </p>
    </form>
  );
}
