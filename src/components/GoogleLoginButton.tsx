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
      className="w-full border border-gray-200 bg-white text-gray-700 py-3 rounded-2xl font-semibold shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all duration-200"
      aria-label="Mit Google anmelden"
      type="button"
    >
      <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
      <span>Mit Google anmelden</span>
    </button>
  );
}
