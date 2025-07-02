import { supabase } from '@/lib/supabase';

export default function GoogleLoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          process.env.NODE_ENV === 'production'
            ? 'https://trackfood.app/auth/callback'
            : 'http://localhost:3000/auth/callback',
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full py-2 px-4 bg-white border rounded shadow flex items-center justify-center gap-2 hover:bg-gray-50 transition text-gray-800 font-semibold"
      aria-label="Mit Google anmelden"
    >
      <img src="/google.svg" alt="Google" className="w-5 h-5" />
      <span>Mit Google anmelden</span>
    </button>
  );
}
