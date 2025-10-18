import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import Footer from "../components/Footer";
import { FaGoogle, FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { signup, isSigningUp } = useAuthStore();

  // ✅ Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Scroll to top on submit (to show toast or any success message)
    window.scrollTo({ top: 0, behavior: "smooth" });

    const valid = validateForm();
    if (valid) signup(formData);
  };

  return (
    <>
      <div className="h-5"></div>
      <div
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 pt-20"
        style={{ backgroundColor: "#0f1419" }}
      >
        <div className="w-full max-w-6xl m-auto">
          <div className="">
            {/* Grid Layout */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Sign Up Form */}
              <div className="flex flex-col justify-center max-w-md mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="text-center mb-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-[#605dff]/30">
                        <MessageSquare className="w-8 h-8 text-[#605dff]" />
                      </div>
                      <h1 className="text-4xl font-bold text-white">
                        Create Account
                      </h1>
                      <p className="text-gray-400 text-base">
                        Get started with your free account
                      </p>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      id="fullName"
                      type="text"
                      className="peer w-full bg-[#2d3748] text-white rounded-xl border border-gray-700 focus:border-[#605dff] focus:ring-2 focus:ring-[#605dff]/40 transition-all duration-200 pl-12 pr-4 py-3.5 outline-none"
                      placeholder=" "
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                    <label
                      htmlFor="fullName"
                      className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200
                                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                                peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-[#605dff]
                                peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#605dff]"
                    >
                      Full Name
                    </label>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      id="email"
                      type="email"
                      className="peer w-full bg-[#2d3748] text-white rounded-xl border border-gray-700 focus:border-[#605dff] focus:ring-2 focus:ring-[#605dff]/40 transition-all duration-200 pl-12 pr-4 py-3.5 outline-none"
                      placeholder=" "
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200
                                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                                peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-[#605dff]
                                peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#605dff]"
                    >
                      Email
                    </label>
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="peer w-full bg-[#2d3748] text-white rounded-xl border border-gray-700 focus:border-[#605dff] focus:ring-2 focus:ring-[#605dff]/40 transition-all duration-200 pl-12 pr-12 py-3.5 outline-none"
                      placeholder=" "
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200
                                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                                peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-[#605dff]
                                peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#605dff]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#605dff] transition z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-[#605dff] hover:bg-[#6663ffc9] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  {/* <div className="text-center text-gray-400 text-sm">
                    Or continue with
                  </div> */}

                  {/* Social Logins */}
                  {/* <div className="flex gap-4">
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 bg-[#2d3748] text-white py-3 rounded-xl border border-gray-700 hover:bg-gray-700 transition-all duration-200"
                    >
                      <FaGoogle /> Google
                    </button>
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 bg-[#2d3748] text-white py-3 rounded-xl border border-gray-700 hover:bg-gray-700 transition-all duration-200"
                    >
                      <FaGithub /> GitHub
                    </button>
                  </div> */}
                </form>

                <div className="text-center mt-6">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-[#605dff] hover:text-[#6663ffc9] font-medium hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="hidden lg:flex flex-col justify-center border-l border-gray-700 pl-12">
                <AuthImagePattern
                  title="Join our community"
                  subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUpPage;
