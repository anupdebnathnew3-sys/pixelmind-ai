import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    toast.success('Password reset link sent!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] via-white to-[#EEF2FF]/50 dark:from-gray-950 dark:via-[#121212] dark:to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">PixelMind AI</span>
        </Link>

        <div className="bg-white dark:bg-[#191c40] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-[#232650]">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-[#6366F1]" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={15} />}
                />
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Sent!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                We've sent a password reset link to <strong className="text-gray-900 dark:text-white">{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
              <Button variant="secondary" onClick={() => setSent(false)}>
                Send Again
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#6366F1] transition-colors">
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setDone(true);
    toast.success('Password reset successfully!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] via-white to-[#EEF2FF]/50 dark:from-gray-950 dark:via-[#121212] dark:to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">PixelMind AI</span>
        </Link>

        <div className="bg-white dark:bg-[#191c40] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-[#232650]">
          {!done ? (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Set New Password</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Choose a strong new password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="New Password" type="password" placeholder="8+ characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <Input label="Confirm New Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                <Button type="submit" fullWidth size="lg" loading={loading}>Reset Password</Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
              <p className="text-gray-500 mb-6 text-sm">Your password has been reset. You can now log in.</p>
              <Link to="/login"><Button fullWidth>Go to Sign In</Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
