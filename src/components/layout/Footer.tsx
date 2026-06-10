import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Mail } from 'lucide-react';

const TOOLS = [
  { label: 'Image to Prompt',    path: '/tools/image-to-prompt' },
  { label: 'Metadata Generator', path: '/tools/metadata' },
  { label: 'Content Writer',     path: '/tools/content-writer' },
  { label: 'Slogan Generator',   path: '/tools/slogan-generator' },
  { label: 'Word Counter',       path: '/tools/word-counter' },
];

const RESOURCES = [
  { label: 'Features',    path: '/features' },
  { label: 'Pricing',     path: '/pricing' },
  { label: 'Tools',       path: '/tools-overview' },
  { label: 'Changelog',   path: '#' },
  { label: 'API Access',  path: '/ai-settings' },
];

const COMPANY = [
  { label: 'About',    path: '/about' },
  { label: 'Blog',     path: '#' },
  { label: 'Careers',  path: '#' },
  { label: 'Contact',  path: '/contact' },
  { label: 'Partners', path: '#' },
];

const LEGAL = [
  { label: 'Terms & Conditions', path: '/terms' },
  { label: 'Privacy Policy',     path: '/privacy' },
  { label: 'Cookie Policy',      path: '#' },
  { label: 'GDPR',               path: '#' },
  { label: 'Security',           path: '#' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0d1030] text-[#71717A] border-t border-[#191c40]">

      {/* ── Main columns ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand — spans 2 cols on large */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 group-hover:shadow-xl group-hover:shadow-[#6366F1]/40 transition-shadow">
                <Zap size={17} className="text-white" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">PixelMind</span>
                <span className="font-extrabold text-[#A5B4FC] text-base tracking-tight"> Pro</span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed mb-5 max-w-xs text-[#52525B]">
              AI-powered tools for creators. Generate prompts, metadata, and content — for every platform, every workflow.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { icon: <span className="text-xs font-black">𝕏</span>,  href: '#', label: 'X / Twitter' },
                { icon: <span className="text-xs font-bold">GH</span>,   href: '#', label: 'GitHub' },
                { icon: <span className="text-xs font-bold">in</span>,   href: '#', label: 'LinkedIn' },
                { icon: <Mail size={13} />,                               href: '#', label: 'Email' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-[#191c40] hover:bg-[#6366F1] border border-[#232650] hover:border-[#6366F1] flex items-center justify-center text-[#71717A] hover:text-white transition-all duration-150"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5">
                <span className="w-4 h-4 rounded-full bg-green-400/20 flex items-center justify-center text-xs">✓</span>
                <span>You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Get product updates"
                  required
                  className="flex-1 min-w-0 bg-[#191c40] border border-[#232650] focus:border-[#6366F1] rounded-xl px-3 py-2 text-xs text-white placeholder-[#52525B] outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] flex items-center justify-center text-white transition-colors shadow-md shadow-[#6366F1]/30"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-tight">Tools</h4>
            <ul className="space-y-2.5">
              {TOOLS.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-xs text-[#71717A] hover:text-white transition-colors leading-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-tight">Resources</h4>
            <ul className="space-y-2.5">
              {RESOURCES.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-xs text-[#71717A] hover:text-white transition-colors leading-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-tight">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-xs text-[#71717A] hover:text-white transition-colors leading-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-tight">Legal</h4>
            <ul className="space-y-2.5">
              {LEGAL.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-xs text-[#71717A] hover:text-white transition-colors leading-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[#191c40]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#52525B]">
            © {new Date().getFullYear()} PixelMind Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#52525B]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              All systems operational
            </span>
            <span className="hidden sm:block">·</span>
            <span>Built for creators, by creators</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
