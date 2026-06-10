import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../../services/firebase';
import { signInWithPopup } from 'firebase/auth';

export const LoginPage: React.FC = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    // Demo login
    if (email === 'admin@pixelmind.ai' && password === 'admin123') {
      login({
        id: '1',
        name: 'Admin User',
        email: 'admin@pixelmind.ai',
        role: 'admin',
        plan: 'enterprise',
        credits: 99999,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        notificationsCount: 3,
        avatar: undefined,
      });
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } else if (email === 'pro@pixelmind.ai' && password === 'pro123') {
      login({
        id: '10',
        name: 'Pro User',
        email: 'pro@pixelmind.ai',
        role: 'user',
        plan: 'pro',
        credits: 5000,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        notificationsCount: 1,
        avatar: undefined,
      });
      toast.success('Welcome back! You\'re on the Pro plan.');
      navigate('/dashboard');
    } else if (email === 'enterprise@pixelmind.ai' && password === 'ent123') {
      login({
        id: '11',
        name: 'Enterprise User',
        email: 'enterprise@pixelmind.ai',
        role: 'user',
        plan: 'enterprise',
        credits: 99999,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        notificationsCount: 0,
        avatar: undefined,
      });
      toast.success('Welcome back! You\'re on the Enterprise plan.');
      navigate('/dashboard');
    } else if (email && password === 'password123') {
      login({
        id: '2',
        name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email,
        role: 'user',
        plan: 'free',
        credits: 500,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        notificationsCount: 2,
        avatar: undefined,
      });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
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
        toast.error('Google sign-in failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1030] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6]">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative flex flex-col items-center justify-center p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2.5 mb-14">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">PixelMind AI</span>
          </Link>
          <div className="max-w-sm text-center">
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Welcome Back!</h2>
            <p className="text-white/75 leading-relaxed text-base">
              Access your AI-powered workspace. Generate metadata, write content, and scale your creative production.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { label: 'AI Providers', value: '8+' },
                { label: 'Marketplaces', value: '7' },
                { label: 'Tools Available', value: '10+' },
                { label: 'Free Credits', value: '500' },
              ].map(item => (
                <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-white/60 text-sm mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-[#0d1030]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">PixelMind AI</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Sign In</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#6366F1] font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            loading={loading}
            className="mb-6"
            icon={<span className="text-base font-bold">G</span>}
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={15} />}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock size={15} />}
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-[#6366F1] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} icon={<Zap size={18} />}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-[#6366F1] hover:underline">Terms</Link> &{' '}
            <Link to="/privacy" className="text-[#6366F1] hover:underline">Privacy Policy</Link>
          </p>

        </div>
      </div>
    </div>
  );
};
