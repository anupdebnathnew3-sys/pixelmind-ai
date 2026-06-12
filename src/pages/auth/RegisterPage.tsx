import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAdminStore } from '../../store/useAdminStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Zap, Mail, Lock, User, Eye, EyeOff, CheckCircle, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, googleProvider, firebaseReady } from '../../services/firebase';
import { signInWithPopup } from 'firebase/auth';

export const RegisterPage: React.FC = () => {
  const { login } = useStore();
  const { registrationEnabled } = useAdminStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login({
      id: Date.now().toString(),
      name: form.name,
      email: form.email,
      role: 'user',
      plan: 'free',
      credits: 500,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      notificationsCount: 1,
    });
    toast.success('Account created! Welcome to PixelMind AI 🎉');
    navigate('/dashboard');
    setLoading(false);
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  if (!registrationEnabled) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1030] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <ShieldOff size={36} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Registration Closed</h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            New account registration is currently disabled by the administrator. Please check back later or contact support if you need access.
          </p>
          <Link to="/login">
            <Button size="lg" icon={<Zap size={18} />}>Sign In Instead</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1030] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6]">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center justify-center p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2.5 mb-14">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Zap size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">PixelMind AI</span>
          </Link>
          <div className="max-w-sm text-center">
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Start Creating Today</h2>
            <p className="text-white/75 leading-relaxed mb-8">
              Join 50,000+ creators who use PixelMind AI to supercharge their creative workflow.
            </p>
            <div className="space-y-2.5">
              {[
                '500 free credits on signup',
                'Access to all AI tools',
                'No credit card required',
                'Cancel anytime',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <CheckCircle size={16} className="text-white/80 flex-shrink-0" />
                  <span className="text-sm text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-[#0d1030]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">PixelMind AI</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#6366F1] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            fullWidth
            onClick={async () => {
              if (!firebaseReady) {
                toast.error('Google sign-up is not configured yet. Please use email & password.');
                return;
              }
              setLoading(true);
              try {
                const result = await signInWithPopup(auth!, googleProvider);
                const user = result.user;
                login({
                  id: user.uid,
                  name: user.displayName || 'User',
                  email: user.email || '',
                  role: 'user',
                  plan: 'free',
                  credits: 500,
                  createdAt: new Date().toISOString(),
                  emailVerified: user.emailVerified,
                  notificationsCount: 0,
                  avatar: user.photoURL ?? undefined,
                });
                toast.success(`Welcome, ${user.displayName || 'User'}!`);
                navigate('/dashboard');
              } catch (err: unknown) {
                const code = (err as { code?: string }).code;
                if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
                  toast.error('Google sign-up failed. Please try again.');
                }
              }
              setLoading(false);
            }}
            loading={loading}
            className="mb-6"
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            }
          >
            Sign up with Google
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">or create with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              icon={<User size={15} />}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              icon={<Mail size={15} />}
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                icon={<Lock size={15} />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {Array(4).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < strength ? strengthColors[strength] : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    Password strength: <span className="font-medium">{strengthLabels[strength]}</span>
                  </p>
                </div>
              )}
            </div>
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              icon={<Lock size={15} />}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 rounded" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-[#6366F1] hover:underline">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-[#6366F1] hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" fullWidth size="lg" loading={loading} icon={<Zap size={18} />}>
              Create Free Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
