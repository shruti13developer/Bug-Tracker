import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bug,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  loginUser,
  registerUser,
} from "../services/authService";

function Auth({ initialMode = "login" }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === "login");

  useEffect(() => {
    setIsLogin(initialMode === "login");
    setError("");
    setSuccess("");
    }, [initialMode]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await loginUser({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
  const nextMode = !isLogin;

  setIsLogin(nextMode);
  setError("");
  setSuccess("");

  setFormData({
    name: "",
    email: "",
    password: "",
  });

  navigate(nextMode ? "/login" : "/register");
};

  if (user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>

          <h1 className="text-2xl font-bold text-white">
            {success}
          </h1>

          <p className="mt-3 text-zinc-400">
            Hello, {user.name}!
          </p>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left">
            <p className="text-sm text-zinc-500">Logged in as</p>
            <p className="mt-1 text-white">{user.email}</p>
            <p className="mt-2 text-sm text-zinc-400">
              Role: {user.role}
            </p>
          </div>

          <p className="mt-5 text-sm text-emerald-400">
            Your frontend and backend are communicating successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRAND SECTION */}
        <div className="relative hidden overflow-hidden border-r border-zinc-800 bg-[#0c0c10] p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5">
              <Bug size={23} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              BugTracker
            </span>
          </div>

          <div className="relative max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300">
              <ShieldCheck size={14} />
              Your team's issue tracking workspace
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Build better.
              <br />
              Fix faster.
              <br />
              <span className="text-indigo-400">
                Ship smarter.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
              Organize projects, track bugs, collaborate with your team,
              and keep every issue moving towards resolution.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Manage projects and issues",
                "Track progress with Kanban boards",
                "Collaborate with your team",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle2 size={17} className="text-indigo-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-zinc-600">
            © 2026 BugTracker. Built for better teamwork.
          </p>
        </div>

        {/* RIGHT AUTH SECTION */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">

            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-indigo-600 p-2.5">
                <Bug size={22} />
              </div>
              <span className="text-xl font-bold">BugTracker</span>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-indigo-400">
                {isLogin ? "WELCOME BACK" : "GET STARTED"}
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                {isLogin
                  ? "Enter your details to access your workspace."
                  : "Create an account to start tracking your projects."}
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
              <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {!isLogin && (
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Full name
                  </label>

                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      minLength={2}
                      maxLength={50}
                      autoComplete="name"
                      required
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Email address
                </label>

                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Password
                </label>

                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    minLength={8}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {!isLogin && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Password must contain at least 8 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}

                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
              <p className="text-sm text-zinc-400">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <button
                  type="button"
                  onClick={switchMode}
                  className="ml-2 font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  {isLogin ? "Create account" : "Sign in"}
                </button>
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-zinc-600">
              Secure authentication powered by BugTracker.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
