"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Shield, Users, BarChart3, Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Sales Rep", email: "amit@ushamartin.com", role: "rep", icon: Mic, color: "from-green-500 to-emerald-600", description: "Record & manage calls" },
  { label: "Manager", email: "rajesh@ushamartin.com", role: "manager", icon: BarChart3, color: "from-blue-500 to-indigo-600", description: "Team analytics & oversight" },
  { label: "Admin", email: "priya@ushamartin.com", role: "admin", icon: Shield, color: "from-purple-500 to-violet-600", description: "Full system access" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);

  const doSignIn = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      setLoadingAccount(null);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSignIn(email, password);
  };

  const handleQuickLogin = async (accountEmail: string) => {
    setLoadingAccount(accountEmail);
    await doSignIn(accountEmail, "demo123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-headline font-extrabold text-white tracking-tighter">
              SalesPulse
            </h1>
          </div>
          <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">
            Usha Martin Ltd. — AI-Powered Call Intelligence
          </p>
        </div>

        {/* Quick Demo Access */}
        <div className="mb-6">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleQuickLogin(account.email)}
                disabled={loading}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAccount === account.email ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
                ) : (
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center mx-auto mb-2`}>
                    <account.icon className="h-5 w-5 text-white" />
                  </div>
                )}
                <p className="text-sm font-bold text-white">{account.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{account.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">or sign in manually</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
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
              {loading && !loadingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
