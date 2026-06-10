import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModalType = 'float' | 'milestone' | 'exit' | 'no-credits';

export const GUEST_INITIAL_CREDITS = 50;

interface GuestState {
  // Credits
  guestCredits: number;
  // Generation tracking (for milestone prompts)
  generations: number;
  // Modal
  showModal: boolean;
  modalType: ModalType;
  // Banner
  bannerDismissed: boolean;
  // One-time milestone flag
  seenMilestone: boolean;

  // Actions
  deductGuestCredit: () => boolean;
  refillCredits: () => void;
  incrementGenerations: () => void;
  dismissBanner: () => void;
  triggerModal: (type: ModalType) => void;
  closeModal: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      guestCredits: GUEST_INITIAL_CREDITS,
      generations: 0,
      showModal: false,
      modalType: 'float',
      bannerDismissed: false,
      seenMilestone: false,

      deductGuestCredit: () => {
        const { guestCredits } = get();
        if (guestCredits <= 0) {
          set({ showModal: true, modalType: 'no-credits' });
          return false;
        }
        const next = guestCredits - 1;
        set({ guestCredits: next });

        // Low credit soft warning at 10
        if (next === 10) {
          setTimeout(() => {
            if (!get().showModal) set({ showModal: true, modalType: 'float' });
          }, 2000);
        }
        return true;
      },

      incrementGenerations: () => {
        const count = get().generations + 1;
        set({ generations: count });

        // 1st generation: gentle nudge after 4s
        if (count === 1) {
          setTimeout(() => {
            if (!get().showModal) set({ showModal: true, modalType: 'float' });
          }, 4000);
        }
        // 3rd: milestone
        if (count === 3 && !get().seenMilestone) {
          set({ showModal: true, modalType: 'milestone', seenMilestone: true });
        }
        // 6th: show again
        if (count === 6) {
          set({ showModal: true, modalType: 'milestone' });
        }
      },

      refillCredits: () => set({ guestCredits: GUEST_INITIAL_CREDITS }),
      dismissBanner: () => set({ bannerDismissed: true }),
      triggerModal: (type) => set({ showModal: true, modalType: type }),
      closeModal: () => set({ showModal: false }),
    }),
    {
      name: 'pixelmind-guest',
      partialize: (s) => ({
        guestCredits: s.guestCredits,
        generations: s.generations,
        seenMilestone: s.seenMilestone,
        bannerDismissed: s.bannerDismissed,
      }),
    }
  )
);
