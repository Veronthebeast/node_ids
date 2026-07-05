import { UpdatePasswordForm } from '@/components/auth/update-password-form';

export const metadata = {
  title: 'Nueva contraseña — NodeIDs',
  description: 'Establece una nueva contraseña',
};

export default function UpdatePasswordPage() {
  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu nueva contraseña
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
