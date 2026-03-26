"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        {/* Blue accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg" />
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-bold text-slate-900">
            Sales Call Recorder
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="amit@ushamartin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="bg-slate-50 border rounded-lg p-3 mt-4">
              <p className="text-xs text-slate-500 text-center font-medium mb-1">Demo accounts (password: demo123)</p>
              <div className="text-xs text-slate-500 text-center space-y-0.5">
                <p>Admin: priya@ushamartin.com</p>
                <p>Manager: rajesh@ushamartin.com</p>
                <p>Rep: amit@ushamartin.com</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
