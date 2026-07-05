import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Iniciar sesión — NodeIDs',
  description: 'Accede a tu cuenta de NodeIDs',
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tus credenciales para continuar
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
