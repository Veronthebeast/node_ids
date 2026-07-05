'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updatePassword } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('password', data.password);

    const result = await updatePassword(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);

    // Redirect to login after a brief delay to show success message
    setTimeout(() => {
      router.push('/login');
      router.refresh();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div
          className="rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-950 dark:text-green-400"
          role="status"
        >
          <p className="font-medium">Contraseña actualizada correctamente</p>
          <p className="mt-1 text-xs opacity-80">Redirigiendo al inicio de sesión...</p>
        </div>
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
        label="Nueva contraseña"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={isLoading}
        hint="Mínimo 6 caracteres"
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
        Actualizar contraseña
      </Button>
    </form>
  );
}
