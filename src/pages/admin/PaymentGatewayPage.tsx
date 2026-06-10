import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useBillingStore, PaymentMethod, PaymentMethodType } from '../../store/useBillingStore';
import {
  ChevronDown, ChevronUp, Save, Eye, EyeOff, Globe, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Credential field config per payment type ─────────────────────────────────

type FieldDef = { key: string; label: string; placeholder?: string; sensitive?: boolean; multiline?: boolean };

const CREDENTIAL_FIELDS: Partial<Record<PaymentMethodType, FieldDef[]>> = {
  bkash: [
    { key: 'number',     label: 'bKash Number',   placeholder: '01XXXXXXXXX' },
    { key: 'merchantId', label: 'Merchant ID',     placeholder: 'MID-...' },
    { key: 'apiKey',     label: 'API Key',         placeholder: 'bkash-api-key', sensitive: true },
  ],
  nagad: [
    { key: 'number',     label: 'Nagad Number',   placeholder: '01XXXXXXXXX' },
    { key: 'merchantId', label: 'Merchant ID',     placeholder: 'MID-...' },
  ],
  rocket: [
    { key: 'number', label: 'Rocket Number', placeholder: '01XXXXXXXXX' },
  ],
  bank: [
    { key: 'bankName',       label: 'Bank Name',       placeholder: 'Dutch-Bangla Bank Ltd.' },
    { key: 'accountName',    label: 'Account Name',    placeholder: 'PixelMind AI' },
    { key: 'accountNumber',  label: 'Account Number',  placeholder: '1234567890' },
    { key: 'routingNumber',  label: 'Routing Number',  placeholder: '090264480' },
    { key: 'branchName',     label: 'Branch Name',     placeholder: 'Gulshan Branch' },
  ],
  payoneer: [
    { key: 'email', label: 'Payoneer Email', placeholder: 'payments@yourdomain.com' },
  ],
  stripe: [
    { key: 'publishableKey', label: 'Publishable Key', placeholder: 'pk_live_...' },
    { key: 'secretKey',      label: 'Secret Key',      placeholder: 'sk_live_...', sensitive: true },
    { key: 'webhookSecret',  label: 'Webhook Secret',  placeholder: 'whsec_...', sensitive: true },
  ],
  paypal: [
    { key: 'clientId',  label: 'Client ID',    placeholder: 'AXxxx...' },
    { key: 'secretKey', label: 'Secret Key',   placeholder: 'EXxxx...', sensitive: true },
    { key: 'email',     label: 'PayPal Email', placeholder: 'payments@yourdomain.com' },
  ],
  card: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all';
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5';

const METHOD_EMOJI: Partial<Record<PaymentMethodType, string>> = {
  bkash:    '💳',
  nagad:    '📱',
  rocket:   '🚀',
  bank:     '🏦',
  payoneer: '🌐',
  stripe:   '💳',
  paypal:   '🅿️',
  card:     '💳',
};

// ─── Single Payment Method Card ───────────────────────────────────────────────

interface MethodCardProps {
  method: PaymentMethod;
  onSave: (id: string, credentials: Record<string, string>, instructions: string, isEnabled: boolean) => void;
}

const MethodCard: React.FC<MethodCardProps> = ({ method, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({ ...method.credentials });
  const [instructions, setInstructions] = useState(method.instructions ?? '');
  const [isEnabled, setIsEnabled] = useState(method.isEnabled);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const fields = CREDENTIAL_FIELDS[method.type] ?? [];

  const handleSave = () => {
    onSave(method.id, credentials, instructions, isEnabled);
  };

  const toggleReveal = (key: string) => setRevealed(r => ({ ...r, [key]: !r[key] }));

  return (
    <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
          {METHOD_EMOJI[method.type] ?? '💰'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">{method.label}</p>
          <p className="text-xs text-gray-400 capitalize">{method.category} payment</p>
        </div>

        {/* Enable/Disable toggle */}
        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{isEnabled ? 'Enabled' : 'Disabled'}</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isEnabled}
              onChange={e => setIsEnabled(e.target.checked)}
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${isEnabled ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>

        <button
          onClick={() => setExpanded(e => !e)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded Credentials */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-[#232650] p-5 space-y-5">
          {fields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Credentials</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className={labelCls}>{field.label}</label>
                    {field.sensitive ? (
                      <div className="relative">
                        <input
                          type={revealed[field.key] ? 'text' : 'password'}
                          className={fieldCls + ' pr-10'}
                          value={credentials[field.key] ?? ''}
                          onChange={e => setCredentials(c => ({ ...c, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                        <button
                          type="button"
                          onClick={() => toggleReveal(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {revealed[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className={fieldCls}
                        value={credentials[field.key] ?? ''}
                        onChange={e => setCredentials(c => ({ ...c, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <label className={labelCls}>Payment Instructions (shown to users)</label>
            <textarea
              className={fieldCls + ' resize-none'}
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Instructions shown to the user when they select this payment method…"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PaymentGatewayPage: React.FC = () => {
  const { paymentMethods, updatePaymentMethod } = useBillingStore();

  const localMethods = paymentMethods.filter(m => m.category === 'local');
  const intlMethods = paymentMethods.filter(m => m.category === 'international');

  const handleSave = (id: string, credentials: Record<string, string>, instructions: string, isEnabled: boolean) => {
    updatePaymentMethod(id, { credentials, instructions, isEnabled });
    toast.success('Payment method settings saved');
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Gateway</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure and manage payment methods</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Methods', value: paymentMethods.length, color: '#6366F1' },
            { label: 'Enabled', value: paymentMethods.filter(m => m.isEnabled).length, color: '#10B981' },
            { label: 'Local (BD)', value: localMethods.length, color: '#F59E0B' },
            { label: 'International', value: intlMethods.length, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bangladesh Methods */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <MapPin size={15} />
            </div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Bangladesh Methods</h2>
            <span className="text-xs text-gray-400">({localMethods.filter(m => m.isEnabled).length} active)</span>
          </div>
          <div className="space-y-3">
            {localMethods.map(method => (
              <MethodCard key={method.id} method={method} onSave={handleSave} />
            ))}
            {localMethods.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No local payment methods configured.</p>
            )}
          </div>
        </section>

        {/* International Methods */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <Globe size={15} />
            </div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">International Methods</h2>
            <span className="text-xs text-gray-400">({intlMethods.filter(m => m.isEnabled).length} active)</span>
          </div>
          <div className="space-y-3">
            {intlMethods.map(method => (
              <MethodCard key={method.id} method={method} onSave={handleSave} />
            ))}
            {intlMethods.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No international payment methods configured.</p>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};
