import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Mail, MessageSquare, Globe, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TOPICS = ['General Inquiry', 'Technical Support', 'Billing', 'Enterprise Sales', 'Partnership', 'Bug Report', 'Feature Request'];

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitted(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1030]">
      <PublicNavbar />
      <div className="pt-20">
        {/* Hero */}
        <section className="py-16 text-center px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Get in <span className="text-[#6366F1]">Touch</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Have a question or need help? We're here for you.
            </p>
          </div>
        </section>

        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-5">
              {[
                { icon: <Mail size={20} />, title: 'Email Us', desc: 'support@pixelmind.ai', sub: 'We reply within 24 hours', color: '#6366F1', bg: '#EEF2FF' },
                { icon: <MessageSquare size={20} />, title: 'Live Chat', desc: 'Available in dashboard', sub: 'Pro & Agency plans', color: '#7C3AED', bg: '#F3F0FF' },
                { icon: <Globe size={20} />, title: 'Help Center', desc: 'docs.pixelmind.ai', sub: 'Guides & tutorials', color: '#059669', bg: '#ECFDF5' },
              ].map(item => (
                <div key={item.title} className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-200 dark:border-[#232650] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.bg, color: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-sm text-[#6366F1] font-medium mt-0.5">{item.desc}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              {submitted ? (
                <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-200 dark:border-[#232650] p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-500 dark:text-gray-400">We've received your message and will respond within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: 'General Inquiry', message: '' }); }}
                    className="mt-6 text-[#6366F1] font-semibold text-sm hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-200 dark:border-[#232650] p-7 space-y-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send a Message</h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Name *</label>
                      <input
                        type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#232650] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Email *</label>
                      <input
                        type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#232650] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Topic</label>
                    <select
                      value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#232650] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                    >
                      {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message *</label>
                    <textarea
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={5} placeholder="Describe your question or issue..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#232650] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none resize-none"
                    />
                  </div>

                  <button type="submit"
                    className="w-full bg-[#6366F1] text-white font-semibold py-3 rounded-xl hover:bg-[#005C66] transition-colors">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
