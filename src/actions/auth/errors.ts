import { AuthError } from '@supabase/supabase-js';

const errorMessages: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos',
  'Email not confirmed': 'Debes confirmar tu correo electrónico antes de iniciar sesión',
  'User already registered': 'Este correo electrónico ya está registrado',
  'Invalid email': 'El formato del correo electrónico no es válido',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'rate_limit': 'Demasiados intentos. Intenta de nuevo en unos minutos',
  'Email link is invalid or has expired': 'El enlace de confirmación no es válido o ha expirado',
  'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la actual',
};

export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return 'Ocurrió un error inesperado';
  
  // Check for known messages
  for (const [key, message] of Object.entries(errorMessages)) {
    if (error.message.includes(key)) return message;
  }
  
  // Fallback
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export { AuthError };
