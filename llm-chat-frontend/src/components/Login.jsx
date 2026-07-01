import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, Sparkles, Loader } from "lucide-react";
import { loginStart, loginSuccess, loginFailure } from "../store/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.ui.theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email address or username is required.");
      isValid = false;
    } else if (email.includes("@") && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(loginStart());

    // Simulate mock server login validation delay
    setTimeout(() => {
      // Demo credentials logic: allows any valid-looking username/email and password of length >= 6
      const mockUser = {
        email,
        name: email.split("@")[0] || "User",
        avatar: ""
      };
      dispatch(loginSuccess(mockUser));
    }, 1200);
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-tr from-[#E7F3F1] via-[#F5F7F7] to-[#C9E0DC] dark:from-[#0d0f10] dark:via-[#16191b] dark:to-[#183c39] transition-colors duration-300">
      
      {/* Background decoration blur bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#245955]/10 dark:bg-[#347d78]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#245955]/8 dark:bg-[#347d78]/5 blur-[140px] pointer-events-none" />

      {/* Main glass login card */}
      <div className="relative w-full max-w-[420px] px-6 py-10 sm:px-10 bg-white/80 dark:bg-[#16191B]/80 backdrop-blur-xl border border-[#E7E7E7] dark:border-[#23272A] rounded-2xl shadow-2xl transition-all duration-300 transform animate-in fade-in zoom-in-95 duration-500">
        
        {/* Glowing Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#245955] dark:bg-[#245955] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#245955]/20 dark:shadow-[#245955]/40 select-none">
            <Sparkles size={28} className="pulse-green" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] dark:text-[#eceff1] font-montserrat tracking-tight">
            Welcome to AI Studio
          </h2>
          <p className="text-xs text-[#737373] dark:text-[#94A3B8] mt-1.5 font-medium">
            Sign in to start messaging platform models
          </p>
        </div>

        {/* Global Dispatch Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-[11px] text-red-600 dark:text-red-400 font-semibold transition-all">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5">
          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] uppercase tracking-wider block">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#94A3B8]">
                <Mail size={16} />
              </span>
              <input
                type="text"
                autoFocus
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                disabled={isLoading}
                className={`w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1E2326] border rounded-xl text-xs text-[#171717] dark:text-[#eceff1] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                  emailError 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                    : "border-[#E7E7E7] dark:border-[#23272A] focus:border-[#245955] dark:focus:border-[#347d78] focus:ring-[#245955] dark:focus:ring-[#347d78]"
                }`}
              />
            </div>
            {emailError && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] uppercase tracking-wider block">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#94A3B8]">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                disabled={isLoading}
                className={`w-full h-11 pl-10 pr-10 bg-white dark:bg-[#1E2326] border rounded-xl text-xs text-[#171717] dark:text-[#eceff1] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                  passwordError 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                    : "border-[#E7E7E7] dark:border-[#23272A] focus:border-[#245955] dark:focus:border-[#347d78] focus:ring-[#245955] dark:focus:ring-[#347d78]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] p-1 rounded transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#245955] hover:bg-[#1e4b48] dark:bg-[#245955] dark:hover:bg-[#347d78] text-white rounded-xl text-xs font-bold shadow-md shadow-[#245955]/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Helper Hint */}
        <div className="mt-8 text-center pt-5 border-t border-[#E7E7E7]/60 dark:border-[#23272A]/50">
          <p className="text-[10px] text-[#A3A3A3] leading-normal">
            For demonstration, you can enter any username and password (6+ characters) to log in.
          </p>
        </div>

      </div>
    </div>
  );
}
