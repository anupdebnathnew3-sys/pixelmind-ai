import React from 'react';
import { X, Zap, Crown, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MetadataUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const MetadataUpgradeModal: React.FC<MetadataUpgradeModalProps> = ({
  open,
  onClose,
  title = 'Premium Feature',
  message = 'Metadata Embedding and ZIP Export are Premium Features. Upgrade to Pro or Max to unlock advanced metadata tools.',
}) => {
  const navigate = useNavigate();
  if (!open) return null;

  const goToPricing = () => { navigate('/pricing'); onClose(); };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899]" />

        <div className="bg-white dark:bg-[#191c40] p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#232650] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2d3270] transition-colors"
          >
            <X size={14} className="text-gray-500 dark:text-gray-400" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
              <Lock size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">{message}</p>
          </div>

          <div className="space-y-2.5 mb-4">
            <button
              onClick={goToPricing}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#6366F1]/25 group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Zap size={15} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">Upgrade to Pro</p>
                <p className="text-[11px] text-white/70">5,000 credits/mo · All export features</p>
              </div>
              <ArrowRight size={15} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={goToPricing}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-amber-400/25 group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Crown size={15} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">Upgrade to Max</p>
                <p className="text-[11px] text-white/70">Unlimited credits · VIP priority · Team access</p>
              </div>
              <ArrowRight size={15} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          <button
            onClick={goToPricing}
            className="w-full py-2 text-sm text-[#6366F1] dark:text-[#A5B4FC] hover:underline transition-colors font-medium"
          >
            View all pricing options →
          </button>
        </div>
      </div>
    </div>
  );
};
