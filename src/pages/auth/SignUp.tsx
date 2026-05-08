import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          date_of_birth: dateOfBirth || null,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Account created! Please check your email to verify your account.",
    });

    navigate("/login");
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Create an account
        </h2>

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                name="firstName"
                type="text"
                required
                className={inputClass}
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                name="lastName"
                type="text"
                required
                className={inputClass}
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              name="phone"
              type="tel"
              required
              className={inputClass}
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              name="dateOfBirth"
              type="date"
              className={inputClass}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

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
            <label className={labelClass}>Password</label>
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
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
