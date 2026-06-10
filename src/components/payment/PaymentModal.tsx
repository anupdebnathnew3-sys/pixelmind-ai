import React, { useState } from 'react';
import { useBillingStore, Plan, PaymentMethod } from '../../store/useBillingStore';
import { useStore } from '../../store/useStore';
import {
  X, CheckCircle, Tag, AlertCircle, Loader2, Copy, ExternalLink, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  plan: Plan;
  currency: 'BDT' | 'USD';
  onClose: () => void;
}

type Step = 'method' | 'details' | 'confirm' | 'success';

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, currency, onClose }) => {
  const { paymentMethods, validateDiscountCode, addTransaction, addSubscription, currencySettings, updateDiscountCode } = useBillingStore();
  const { user } = useStore();

  const [step, setStep]                     = useState<Step>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [couponInput, setCouponInput]       = useState('');
  const [appliedCoupon, setAppliedCoupon]   = useState<ReturnType<typeof validateDiscountCode>>(null);
  const [couponError, setCouponError]       = useState('');
  const [txRef, setTxRef]                   = useState('');
  const [notes, setNotes]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [txId, setTxId]                     = useState('');

  const enabledMethods = paymentMethods.filter(m => m.isEnabled);
  const localMethods = enabledMethods.filter(m => m.category === 'local');
  const intlMethods  = enabledMethods.filter(m => m.category === 'international');

  const basePrice = plan.priceBDT;
  const isBDT = currency === 'BDT';
  const rate = currencySettings.bdtToUsdRate;

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? basePrice * (appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;
  const finalBDT = Math.max(0, basePrice - discountAmount);
  const finalDisplay = isBDT
    ? `৳${finalBDT.toLocaleString('en-BD')}`
    : `$${(finalBDT / rate).toFixed(2)}`;
  const originalDisplay = isBDT
    ? `৳${basePrice.toLocaleString('en-BD')}`
    : `$${(basePrice / rate).toFixed(2)}`;

  const handleApplyCoupon = () => {
    setCouponError('');
    const dc = validateDiscountCode(couponInput.trim(), plan.id);
    if (!dc) { setCouponError('Invalid or expired coupon code'); return; }
    setAppliedCoupon(dc);
    toast.success(`Coupon applied — ${dc.type === 'percentage' ? dc.value + '%' : '৳' + dc.value} off!`);
  };

  const isManualMethod = (m: PaymentMethod) =>
    ['bkash', 'nagad', 'rocket', 'bank'].includes(m.type);

  const getMethodNumber = (m: PaymentMethod) =>
    m.credentials.number || m.credentials.email || m.credentials.accountNumber || '—';

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success('Copied!');
  };

  const handleSubmit = async () => {
    if (!user || !selectedMethod) return;
    if (isManualMethod(selectedMethod) && !txRef.trim()) {
      toast.error('Please enter your Transaction ID / Reference');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const newTxId = `TXN${Date.now().toString().slice(-6)}`;
    setTxId(newTxId);

    addTransaction({
      id: newTxId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      planId: plan.id,
      planName: plan.displayName,
      amount: finalBDT,
      currency: 'BDT',
      status: isManualMethod(selectedMethod) ? 'pending' : 'completed',
      paymentMethod: selectedMethod.label,
      transactionRef: txRef || `AUTO-${newTxId}`,
      discountCode: appliedCoupon?.code,
      notes: isManualMethod(selectedMethod) ? 'Awaiting admin verification' : notes,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    if (appliedCoupon) {
      updateDiscountCode(appliedCoupon.id, { usedCount: appliedCoupon.usedCount + 1 });
    }

    const start = new Date().toISOString().slice(0, 10);
    const end = new Date(
      plan.billingCycle === 'yearly'
        ? Date.now() + 365 * 24 * 60 * 60 * 1000
        : Date.now() + 30  * 24 * 60 * 60 * 1000
    ).toISOString().slice(0, 10);

    addSubscription({
      id: `SUB${Date.now().toString().slice(-6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      planId: plan.id,
      planName: plan.displayName,
      status: isManualMethod(selectedMethod) ? 'trialing' : 'active',
      startDate: start,
      endDate: end,
      nextBillingDate: end,
      amount: finalBDT,
      currency: 'BDT',
      paymentMethod: selectedMethod.label,
      autoRenew: true,
      discountCode: appliedCoupon?.code,
    });

    setLoading(false);
    setStep('success');
  };

  // ── Step: Method selection ─────────────────────────────────────────────────
  if (step === 'method') {
    return (
      <ModalShell onClose={onClose} title={`Upgrade to ${plan.displayName}`} subtitle="Choose your payment method">
        <div className="p-6 space-y-5">
          {/* Price + coupon */}
          <div className="rounded-2xl bg-gray-50 dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{plan.displayName} plan</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{originalDisplay}/{plan.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
            </div>
            {/* Coupon row */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                  placeholder="Coupon code"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#131635] text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                />
              </div>
              <button onClick={handleApplyCoupon} disabled={!couponInput.trim()} className="px-4 py-2 rounded-lg bg-[#6366F1] text-white text-sm font-semibold disabled:opacity-50">
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{couponError}</p>}
            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ {appliedCoupon.code} applied</span>
                <span className="text-emerald-600 dark:text-emerald-400">-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `৳${appliedCoupon.value}`}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-[#232650] pt-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-lg font-black text-[#6366F1]">{finalDisplay}</span>
            </div>
          </div>

          {/* Local methods */}
          {localMethods.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bangladesh</p>
              <div className="space-y-2">
                {localMethods.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMethod(m); setStep('details'); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#131635] hover:border-[#6366F1]/50 hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-all text-left">
                    <span className="text-xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.label}</p>
                      <p className="text-xs text-gray-400">Manual verification · instant activation after approval</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* International methods */}
          {intlMethods.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">International</p>
              <div className="space-y-2">
                {intlMethods.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMethod(m); setStep('details'); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#131635] hover:border-[#6366F1]/50 hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-all text-left">
                    <span className="text-xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.label}</p>
                      <p className="text-xs text-gray-400">Secure payment</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {enabledMethods.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No payment methods are currently active.</p>
              <p className="text-xs mt-1">Please contact support to complete your subscription.</p>
            </div>
          )}
        </div>
      </ModalShell>
    );
  }

  // ── Step: Payment details ──────────────────────────────────────────────────
  if (step === 'details' && selectedMethod) {
    const num = getMethodNumber(selectedMethod);
    const isManual = isManualMethod(selectedMethod);

    return (
      <ModalShell onClose={onClose} title={`Pay with ${selectedMethod.label}`} onBack={() => setStep('method')}>
        <div className="p-6 space-y-5">
          {isManual ? (
            <>
              {/* Amount */}
              <div className="rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-5 text-white text-center">
                <p className="text-sm text-white/70 mb-1">Amount to send</p>
                <p className="text-4xl font-black">৳{finalBDT.toLocaleString('en-BD')}</p>
                <p className="text-sm text-white/70 mt-1">{plan.displayName} plan · {plan.billingCycle}</p>
              </div>

              {/* Send-to number */}
              {num !== '—' && (
                <div className="rounded-2xl bg-gray-50 dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Send to {selectedMethod.label} number</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-gray-900 dark:text-white tracking-wider">{num}</span>
                    <button onClick={() => handleCopyNumber(num)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#232650] transition-colors">
                      <Copy size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod.instructions && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-700/30 p-3 text-xs text-blue-700 dark:text-blue-400">
                  {selectedMethod.instructions}
                </div>
              )}

              {/* How it works steps */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-700/30 p-4">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-3">How it works</p>
                <ol className="space-y-2">
                  {[
                    `Send ৳${finalBDT.toLocaleString('en-BD')} to the number shown above`,
                    'Note your Transaction ID from your mobile banking app',
                    'Enter it in the field below and click Continue',
                    'Admin verifies payment (usually within a few hours)',
                    `Your ${plan.displayName} plan activates automatically`,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300 text-[10px] font-black flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Transaction ref */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Transaction ID / Reference <span className="text-red-500">*</span>
                </label>
                <input
                  value={txRef}
                  onChange={e => setTxRef(e.target.value)}
                  placeholder="e.g. BK8X9Y2Z1"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Note (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional info for admin verification"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#6366F1] resize-none"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <span className="text-5xl">{selectedMethod.icon}</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-4">{selectedMethod.label} integration</p>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                Automated payment processing via {selectedMethod.label} is configured by your admin. Contact support to complete your payment.
              </p>
              <a href="mailto:support@pixelmind.ai" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors">
                <ExternalLink size={14} /> Contact Support
              </a>
            </div>
          )}

          {isManual && (
            <button
              onClick={() => setStep('confirm')}
              disabled={!txRef.trim()}
              className="w-full py-3 rounded-xl bg-[#6366F1] text-white text-sm font-bold hover:bg-[#4F46E5] disabled:opacity-50 transition-colors"
            >
              Continue to Confirm
            </button>
          )}
        </div>
      </ModalShell>
    );
  }

  // ── Step: Confirmation ─────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <ModalShell onClose={onClose} title="Confirm your order" onBack={() => setStep('details')}>
        <div className="p-6 space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-[#232650] divide-y divide-gray-100 dark:divide-[#232650] overflow-hidden">
            {[
              ['Plan',       plan.displayName],
              ['Billing',    plan.billingCycle === 'yearly' ? 'Annual' : 'Monthly'],
              ['Method',     selectedMethod?.label ?? ''],
              ['TX Ref',     txRef],
              ['Amount',     `৳${finalBDT.toLocaleString('en-BD')}`],
              ...(appliedCoupon ? [['Coupon', appliedCoupon.code]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30 p-3 text-xs text-amber-700 dark:text-amber-400">
            Your subscription will be activated after admin verifies your payment (usually within a few hours).
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6366F1] text-white text-sm font-bold hover:bg-[#4F46E5] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit Payment'}
          </button>
        </div>
      </ModalShell>
    );
  }

  // ── Step: Success ──────────────────────────────────────────────────────────
  return (
    <ModalShell onClose={onClose} title="">
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Payment submitted!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">
          Your payment is being verified. You'll be notified once your <strong>{plan.displayName}</strong> plan is activated.
        </p>
        <div className="rounded-xl bg-gray-50 dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] p-4 text-sm mb-5">
          <p className="text-gray-500 dark:text-gray-400">Reference ID</p>
          <p className="font-mono font-bold text-gray-900 dark:text-white mt-0.5">{txId}</p>
        </div>

        {/* Payment status tracker */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {/* Step 1 — submitted */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 flex items-center justify-center">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black">✓</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center max-w-[60px] leading-tight">Payment submitted</span>
          </div>
          <div className="h-0.5 w-10 bg-amber-400/60 mb-4" />
          {/* Step 2 — verifying */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-400 text-xs">⏳</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 text-center max-w-[60px] leading-tight">Admin verification</span>
          </div>
          <div className="h-0.5 w-10 bg-gray-200 dark:bg-[#232650] mb-4" />
          {/* Step 3 — not yet activated */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#191c40] border-2 border-gray-300 dark:border-[#232650] flex items-center justify-center">
              <span className="text-gray-400 text-xs font-black">○</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 text-center max-w-[60px] leading-tight">Plan activated</span>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-xl bg-[#6366F1] text-white text-sm font-bold hover:bg-[#4F46E5] transition-colors">
          Done
        </button>
      </div>
    </ModalShell>
  );
};

// ─── Modal shell ──────────────────────────────────────────────────────────────

function ModalShell({ children, onClose, title, subtitle, onBack }: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#131635] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#232650] overflow-hidden max-h-[90vh] flex flex-col">
        {title && (
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#232650] flex-shrink-0">
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#232650] text-gray-500 transition-colors">
                <ArrowRight size={14} className="rotate-180" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">{title}</h2>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#232650] text-gray-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
