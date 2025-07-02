import { supabase } from '@/lib/supabase';

export default function GoogleLoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/dashboard' : undefined,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full py-2 px-4 bg-white border rounded shadow flex items-center justify-center gap-2 hover:bg-gray-50 transition"
      aria-label="Mit Google anmelden"
    >
      <img src="/google.svg" alt="Google" className="w-5 h-5" />
      <span>Mit Google anmelden</span>
    </button>
  );
}
