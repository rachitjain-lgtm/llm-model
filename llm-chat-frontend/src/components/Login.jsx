import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Loader, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  KeyRound 
} from "lucide-react";
import { 
  authStart, 
  loginSuccess,
  authFailure, 
  registerSuccess, 
  recoverySuccess, 
  resetPasswordSuccess,
  clearError 
} from "../store/authSlice";
import axiosClient from "../api/axiosClient";

const getResetContext = () => {
  if (typeof window === "undefined") {
    return {
      initialEmail: "",
      initialView: "login"
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    initialEmail: params.get("email") || "",
    initialView: params.get("reset") === "true" || params.has("token")
      ? "reset-password"
      : "login"
  };
};

export default function Login() {
  const dispatch = useDispatch();
  const { isLoading, error, recoveryEmailSent } = useSelector((state) => state.auth);
  const googleAuthEnabled = false;
  const { initialEmail, initialView } = getResetContext();

  // View state: 'login' | 'signup' | 'forgot' | 'reset-password'
  const [view, setView] = useState(initialView);

  // Input states
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Reset Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Field validations
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const switchView = (nextView) => {
    dispatch(clearError());
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setConfirmPasswordError("");
    setView(nextView);
  };

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
    setEmailError("");
    setPasswordError("");
    setNameError("");
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    dispatch(authStart());
    try {
      const response = await axiosClient.post("/auth/login", {
        email: email.trim(),
        password: password,
      });
      if (response.data && response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        dispatch(loginSuccess({ user, accessToken, refreshToken }));
      } else {
        dispatch(authFailure(response.data.message || "Login failed."));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to connect to backend server.";
      dispatch(authFailure(msg));
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    dispatch(authStart());
    try {
      const response = await axiosClient.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password,
      });
      if (response.data && response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        dispatch(registerSuccess());
        dispatch(loginSuccess({ user, accessToken, refreshToken }));
      } else {
        dispatch(authFailure(response.data.message || "Registration failed."));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to register account.";
      dispatch(authFailure(msg));
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!validateForgot()) return;

    dispatch(authStart());

    setTimeout(() => {
      dispatch(recoverySuccess());
    }, 1000);
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");

    if (!newPassword) {
      setPasswordError("New password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    dispatch(authStart());

    setTimeout(() => {
      dispatch(resetPasswordSuccess({ email: email.trim(), newPassword }));
      setPassword(newPassword); // Pre-fill password for instant sign-in
      setResetSuccess(true);
    }, 1000);
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-tr from-[#E7F3F1] via-[#F5F7F7] to-[#C9E0DC] transition-colors duration-300">
      
      {/* Background decoration blur bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#245955]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#245955]/8 blur-[140px] pointer-events-none" />

      {/* Main glass login card */}
      <div className="relative w-full max-w-[420px] px-6 py-10 sm:px-10 bg-white/90 backdrop-blur-xl border border-[#E7E7E7] rounded-2xl shadow-2xl transition-all duration-300 transform animate-in fade-in zoom-in-95">
        
        {/* Glowing Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#245955] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#245955]/20 select-none">
            <Sparkles size={28} className="pulse-green" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] font-montserrat tracking-tight">
            {view === "login" && "Welcome to AI Studio"}
            {view === "signup" && "Create an Account"}
            {view === "forgot" && "Forgot Password"}
            {view === "reset-password" && "Set New Password"}
          </h2>
          <p className="text-xs text-[#737373] mt-1.5 font-medium">
            {view === "login" && "Sign in to start configuring foundation models"}
            {view === "signup" && "Register to save your model chat sessions"}
            {view === "forgot" && "Enter your email to receive a password reset link"}
            {view === "reset-password" && "Create a new password to restore access to your account"}
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
                  onClick={() => switchView("forgot")}
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

            {/* Google OAuth Section */}
            <div className="pt-1">
              <div className="relative flex items-center justify-center my-3.5">
                <div className="border-t border-[#E7E7E7] w-full" />
                <span className="bg-white/90 px-2 text-[10px] uppercase font-bold text-[#A3A3A3] absolute">
                  or continue with
                </span>
              </div>

              <div className="flex justify-center w-full min-h-[40px]">
                {googleAuthEnabled ? (
                  <div />
                ) : (
                  <div className="text-[10px] text-[#737373] text-center leading-normal">
                    Google sign-in is disabled until backend OAuth support is added.
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-4 text-[11px] font-medium text-[#737373]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("signup")}
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

            {/* Google OAuth Section */}
            <div className="pt-1">
              <div className="relative flex items-center justify-center my-3.5">
                <div className="border-t border-[#E7E7E7] w-full" />
                <span className="bg-white/90 px-2 text-[10px] uppercase font-bold text-[#A3A3A3] absolute">
                  or continue with
                </span>
              </div>

              <div className="flex justify-center w-full min-h-[40px]">
                {googleAuthEnabled ? (
                  <div />
                ) : (
                  <div className="text-[10px] text-[#737373] text-center leading-normal">
                    Google sign-up is disabled until backend OAuth support is added.
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-4 text-[11px] font-medium text-[#737373]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("login")}
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
              <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#171717] font-montserrat">Reset Link Dispatched</h3>
                  <p className="text-xs text-[#737373] leading-relaxed px-2">
                    We've generated a password reset link for <span className="font-semibold text-[#171717]">{email}</span> on behalf of AI Studio Bedrock.
                  </p>
                </div>

                <div className="p-3.5 bg-[#E7F3F1]/50 border border-[#245955]/20 rounded-xl text-left space-y-2.5 my-2">
                  <div className="text-[11px] font-bold text-[#245955] flex items-center gap-1.5">
                    <KeyRound size={14} />
                    <span>Password Reset Link Created</span>
                  </div>
                  <p className="text-[10px] text-[#737373] leading-normal">
                    Click the button below to open your secure password change form:
                  </p>
                  <button
                    onClick={() => {
                      setNewPassword("");
                      setConfirmNewPassword("");
                      setResetSuccess(false);
                      switchView("reset-password");
                    }}
                    className="w-full h-10 bg-[#245955] hover:bg-[#1e4b48] text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Open Password Change Page</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    switchView("login");
                    setEmail("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737373] hover:text-[#171717] cursor-pointer"
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
                      Generating Reset Link...
                    </>
                  ) : (
                    "Send Password Reset Link"
                  )}
                </button>

                <div className="text-center mt-5">
                  <button
                    type="button"
                    onClick={() => switchView("login")}
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

        {/* RESET PASSWORD VIEW */}
        {view === "reset-password" && (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#171717] font-montserrat">Password Changed!</h3>
                  <p className="text-xs text-[#737373] leading-normal px-2">
                    Your password for <span className="font-semibold text-[#171717]">{email}</span> has been successfully updated on our server.
                  </p>
                </div>
                <button
                  onClick={() => switchView("login")}
                  className="w-full h-11 bg-[#245955] hover:bg-[#1e4b48] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md mt-2"
                >
                  Sign In with New Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="text-xs font-medium text-[#737373] mb-2 bg-[#F5F7F7] p-2.5 rounded-xl border border-[#E7E7E7]">
                  Updating password for: <span className="font-bold text-[#171717]">{email || "your account"}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
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

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#171717] uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
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
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => switchView("login")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737373] hover:text-[#171717] cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Demo Helper Hint */}
        <div className="mt-8 text-center pt-5 border-t border-[#E7E7E7]/60">
          <p className="text-[10px] text-[#A3A3A3] leading-normal">
            For demonstration, register any account to save it into the local browser database, or use: demo@bedrock.com / password123
          </p>
        </div>

      </div>
    </div>
  );
}
