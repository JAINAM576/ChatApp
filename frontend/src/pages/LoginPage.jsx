import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

 
  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
     try {
      await login(formData);
      toast.success("Logged in successfully!");
    } catch (err) {
      toast.error(err?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 relative overflow-hidden bg-[#0d1117] text-white">
    
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow-delayed"></div>
      </div>

      
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10">
          
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-3 group relative">
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-2xl opacity-0 group-hover:opacity-80 transition-all duration-700"></div>
              <div
                className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-all duration-300"
              >
                <MessageSquare className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h1 className="text-3xl font-semibold mt-2 tracking-tight text-white">
                Welcome Back
              </h1>
              <p className="text-gray-400 text-sm">Sign in to your account</p>
            </div>
          </div>

         
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-300">
                  Email
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-300">
                  Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-blue-400 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-blue-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white border-none h-11 font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-400 hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      
      <AuthImagePattern
        title="Welcome back!"
        subtitle="Sign in to continue your conversations and catch up with your messages."
      />
    </div>
  );
};

export default LoginPage;