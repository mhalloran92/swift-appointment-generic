import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type PageState = "loading" | "ready" | "invalid" | "success";

const ResetPassword = () => {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase parses the access_token from the URL fragment and fires
    // PASSWORD_RECOVERY when the user lands here from the reset email link.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });

    // Fallback: if there's already an active session from the token in the URL,
    // getSession() will return it synchronously before the event fires.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPageState("ready");
    });

    // Give the token a moment to be parsed; mark invalid if nothing arrives.
    const timeout = setTimeout(() => {
      setPageState((current) => (current === "loading" ? "invalid" : current));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both fields are identical.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.message,
      });
      return;
    }

    await supabase.auth.signOut();
    setPageState("success");
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">

        {/* ── Loading ── */}
        {pageState === "loading" && (
          <div className="text-center space-y-3">
            <div className="mx-auto h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-slate-500">Verifying reset link…</p>
          </div>
        )}

        {/* ── Invalid / expired ── */}
        {pageState === "invalid" && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Link expired</h2>
            <p className="text-sm text-slate-500">
              This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Request a new link
            </button>
          </div>
        )}

        {/* ── Reset form ── */}
        {pageState === "ready" && (
          <>
            <div>
              <h2 className="text-center text-3xl font-extrabold text-slate-900">
                Set new password
              </h2>
              <p className="mt-2 text-center text-sm text-slate-500">
                Choose a strong password for your account.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleReset}>
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}

        {/* ── Success ── */}
        {pageState === "success" && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Password updated</h2>
            <p className="text-sm text-slate-500">
              Your password has been changed. Sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Go to sign in
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
