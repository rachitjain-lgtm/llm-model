import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, Sparkles, Loader, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authStart, loginSuccess, authFailure, registerSuccess, recoverySuccess, clearError } from "../store/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const { isLoading, error, usersDb, recoveryEmailSent } = useSelector((state) => state.auth);

  // View state: 'login' | 'signup' | 'forgot'
  const [view, setView] = useState("login");

  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Field validations
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Clear errors on switching tabs/views
  useEffect(() => {
    dispatch(clearError());
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setConfirmPasswordError("");
  }, [view, dispatch]);

  const validateLogin = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }

    return valid;
  };

  const validateSignup = () => {
    let valid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }

    return valid;
  };

  const validateForgot = () => {
    let valid = true;
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    return valid;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    dispatch(authStart());

    setTimeout(() => {
      // Find matching user from local database
      const matched = usersDb.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (matched && matched.password === password) {
        dispatch(loginSuccess({
          email: matched.email,
          name: matched.name,
          avatar: ""
        }));
      } else {
        dispatch(authFailure("Invalid email or password."));
      }
    }, 1000);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    dispatch(authStart());

    setTimeout(() => {
      const exists = usersDb.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (exists) {
        dispatch(authFailure("This email is already registered."));
      } else {
        const newUser = {
          email: email.trim(),
          password: password,
          name: name.trim()
        };
        dispatch(registerSuccess(newUser));
        // Auto login on successful signup
        dispatch(loginSuccess({
          email: newUser.email,
          name: newUser.name,
          avatar: ""
        }));
      }
    }, 1000);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!validateForgot()) return;

    dispatch(authStart());

    setTimeout(() => {
      dispatch(recoverySuccess());
    }, 1000);
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-tr from-[#E7F3F1] via-[#F5F7F7] to-[#C9E0DC] transition-colors duration-300">
      
      {/* Background decoration blur bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#245955]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#245955]/8 blur-[140px] pointer-events-none" />

      {/* Main glass login card */}
      <div className="relative w-full max-w-[420px] px-6 py-10 sm:px-10 bg-white/90 backdrop-blur-xl border border-[#E7E7E7] rounded-2xl shadow-2xl transition-all duration-300 transform animate-in fade-in zoom-in-95 duration-500">
        
        {/* Glowing Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#245955] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#245955]/20 select-none">
            <Sparkles size={28} className="pulse-green" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] font-montserrat tracking-tight">
            {view === "login" && "Welcome to AI Studio"}
            {view === "signup" && "Create an Account"}
            {view === "forgot" && "Reset Password"}
          </h2>
          <p className="text-xs text-[#737373] mt-1.5 font-medium">
            {view === "login" && "Sign in to start configuring foundation models"}
            {view === "signup" && "Register to save your model chat sessions"}
            {view === "forgot" && "Get a link to restore access to your account"}
          </p>
        </div>

        {/* Global Error Message */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-600 font-semibold transition-all">
            {error}
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
                  <Mail size={16} />
                </span>
                <input
                  type="text"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-xs text-[#171717] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                    emailError 
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                      : "border-[#E7E7E7] focus:border-[#245955] focus:ring-[#245955]"
                  }`}
                />
              </div>
              {emailError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{emailError}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-[10px] font-bold text-[#245955] hover:text-[#1e4b48] cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
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
                  className={`w-full h-11 pl-10 pr-10 bg-white border rounded-xl text-xs text-[#171717] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                    passwordError 
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                      : "border-[#E7E7E7] focus:border-[#245955] focus:ring-[#245955]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] p-1 rounded transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{passwordError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#245955] hover:bg-[#1e4b48] text-white rounded-xl text-xs font-bold shadow-md shadow-[#245955]/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6"
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

            <div className="text-center mt-5 text-[11px] font-medium text-[#737373]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setView("signup")}
                className="font-bold text-[#245955] hover:text-[#1e4b48] cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {view === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-xs text-[#171717] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                    nameError 
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                      : "border-[#E7E7E7] focus:border-[#245955] focus:ring-[#245955]"
                  }`}
                />
              </div>
              {nameError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{nameError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
                  <Mail size={16} />
                </span>
                <input
                  type="text"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-xs text-[#171717] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                    emailError 
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                      : "border-[#E7E7E7] focus:border-[#245955] focus:ring-[#245955]"
                  }`}
                />
              </div>
              {emailError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{emailError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
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
                  className={`w-full h-11 pl-10 pr-10 bg-white border rounded-xl text-xs text-[#171717] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                    passwordError 
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                      : "border-[#E7E7E7] focus:border-[#245955] focus:ring-[#245955]"
                  }`}
                />
              </div>
              {passwordError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{passwordError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError("");
                  }}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-10 bg-white border rounded-xl text-xs text-[#171717] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                    confirmPasswordError 
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                      : "border-[#E7E7E7] focus:border-[#245955] focus:ring-[#245955]"
                  }`}
                />
              </div>
              {confirmPasswordError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{confirmPasswordError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#245955] hover:bg-[#1e4b48] text-white rounded-xl text-xs font-bold shadow-md shadow-[#245955]/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center mt-5 text-[11px] font-medium text-[#737373]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="font-bold text-[#245955] hover:text-[#1e4b48] cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === "forgot" && (
          <div className="space-y-5">
            {recoveryEmailSent ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#171717] font-montserrat">Check Your Inbox</h3>
                  <p className="text-xs text-[#737373] leading-normal px-2">
                    We've sent a recovery link to **{email}**. (Check your spam folder if it doesn't arrive).
                  </p>
                </div>
                <button
                  onClick={() => {
                    setView("login");
                    setEmail("");
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#245955] hover:text-[#1e4b48] mt-4 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
                      <Mail size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      disabled={isLoading}
                      className={`w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-xs text-[#171717] font-semibold placeholder:text-[#A3A3A3] focus:outline-none focus:ring-1 transition-all ${
                        emailError 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                      : "border-[#E7E7E7] focus:border-[#245955] focus:ring-[#245955]"
                      }`}
                    />
                  </div>
                  {emailError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#245955] hover:bg-[#1e4b48] text-white rounded-xl text-xs font-bold shadow-md shadow-[#245955]/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    "Send Recovery Link"
                  )}
                </button>

                <div className="text-center mt-5">
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245955] hover:text-[#1e4b48] cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Demo Helper Hint */}
        <div className="mt-8 text-center pt-5 border-t border-[#E7E7E7]/60">
          <p className="text-[10px] text-[#A3A3A3] leading-normal">
            For demonstration, register any account to save it into the mock local database, or use: **demo@bedrock.com** / **password123**
          </p>
        </div>

      </div>
    </div>
  );
}
