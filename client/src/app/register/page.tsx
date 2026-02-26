"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUserPlus, FiCheck, FiArrowLeft } from "react-icons/fi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Confirm password validation
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    setLoading(true);
    setPasswordMatch(true);
    
    try {
      await api.post("/auth/register", {
        email,
        password,
      });
      router.push("/login");
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value || e.target.value === "");
  };

  return (
    
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col items-center justify-center p-6">
      <Link 
  href="/" 
  className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium group"
>
  <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
  Back to Home
</Link>
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
          Create Account
        </h1>
        <p className="text-slate-500">Join our weather community today</p>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Create a strong password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              {passwordMatch ? (
                <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
              ) : null}
              <input
                type="password"
                placeholder="Confirm your password"
                required
                className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 ${
                  passwordMatch 
                    ? "border-slate-200 focus:ring-blue-500" 
                    : "border-red-300 focus:ring-red-500 bg-red-50"
                }`}
                onChange={handleConfirmPasswordChange}
                disabled={loading}
              />
            </div>
            {!passwordMatch && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordMatch}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Creating account..." : (
              <>
                <FiUserPlus /> Register Now
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
