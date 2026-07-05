import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Crear cuenta — NodeIDs',
  description: 'Regístrate en NodeIDs',
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Regístrate para empezar a usar NodeIDs
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
