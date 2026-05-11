import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type View = "login" | "forgot" | "sent";

const Login = () => {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast({ title: "Success", description: "Logged in successfully" });
    navigate("/");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return;
    }

    setView("sent");
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">

        {/* ── Sign in ── */}
        {view === "login" && (
          <>
            <h2 className="text-center text-3xl font-extrabold text-slate-900">
              Sign in to your account
            </h2>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Password</label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs font-medium text-primary hover:text-primary/80"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className={inputClass}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 mt-2"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="text-center text-sm">
              <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
                Don't have an account? Sign up
              </Link>
            </div>
          </>
        )}

        {/* ── Forgot password ── */}
        {view === "forgot" && (
          <>
            <div>
              <h2 className="text-center text-3xl font-extrabold text-slate-900">
                Reset your password
              </h2>
              <p className="mt-2 text-center text-sm text-slate-500">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setView("login")}
                className="font-medium text-primary hover:text-primary/80"
              >
                ← Back to sign in
              </button>
            </div>
          </>
        )}

        {/* ── Email sent confirmation ── */}
        {view === "sent" && (
          <>
            <div className="text-center space-y-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-500">
                We sent a password reset link to <span className="font-medium text-slate-700">{email}</span>.
                The link expires in 1 hour.
              </p>
            </div>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setView("login")}
                className="font-medium text-primary hover:text-primary/80"
              >
                ← Back to sign in
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
