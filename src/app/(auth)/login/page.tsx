"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-headline font-extrabold text-white tracking-tighter">
            SalesPulse
          </h1>
          <p className="text-sm text-slate-400 mt-2 uppercase tracking-[0.2em]">
            Usha Martin Ltd.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-headline font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="amit@ushamartin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-blue-700 text-white rounded-full font-headline font-bold text-base shadow-lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-[0.15em] mb-2">Demo Accounts (password: demo123)</p>
            <div className="text-xs text-slate-500 text-center space-y-0.5">
              <p>Admin: priya@ushamartin.com</p>
              <p>Manager: rajesh@ushamartin.com</p>
              <p>Rep: amit@ushamartin.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
