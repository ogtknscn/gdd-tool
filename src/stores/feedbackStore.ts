import { create } from 'zustand';
import { t } from '../domain/i18n';
import { useUiStore } from './uiStore';

type ConfirmDialog = { id: string; type: 'confirm'; title: string; message: string; tone: 'normal' | 'danger'; confirmLabel: string; cancelLabel: string; resolve: (value: boolean) => void };
type PromptDialog = { id: string; type: 'prompt'; title: string; message?: string; initialValue: string; inputLabel: string; confirmLabel: string; cancelLabel: string; resolve: (value: string | null) => void };
type ChoiceDialog = { id: string; type: 'choice'; title: string; message: string; choices: Array<{ value: string; label: string; tone?: 'normal' | 'danger' }>; cancelLabel: string; resolve: (value: string | null) => void };
export type FeedbackDialog = ConfirmDialog | PromptDialog | ChoiceDialog;
export type ToastTone = 'info' | 'success' | 'error';
export type FeedbackToast = { id: string; message: string; tone: ToastTone };
type State = { active?: FeedbackDialog; queue: FeedbackDialog[]; toasts: FeedbackToast[]; enqueue: (dialog: FeedbackDialog) => void; settle: (value: boolean | string | null) => void; pushToast: (message: string, tone: ToastTone) => void; dismissToast: (id: string) => void; reset: () => void };
const id = () => `feedback-${crypto.randomUUID()}`;
export const useFeedbackStore = create<State>((set, get) => ({
  queue: [], toasts: [],
  enqueue: (dialog) => set((state) => state.active ? { queue: [...state.queue, dialog] } : { active: dialog }),
  settle: (value) => { const current = get().active; if (!current) return; if (current.type === 'confirm') current.resolve(Boolean(value)); else current.resolve(typeof value === 'string' ? value : null); const [active, ...queue] = get().queue; set({ active, queue }); },
  pushToast: (message, tone) => set((state) => ({ toasts: [...state.toasts.slice(-2), { id: id(), message, tone }] })),
  dismissToast: (toastId) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== toastId) })),
  reset: () => { const pending = [get().active, ...get().queue].filter(Boolean) as FeedbackDialog[]; pending.forEach((dialog) => { if (dialog.type === 'confirm') dialog.resolve(false); else dialog.resolve(null); }); set({ active: undefined, queue: [], toasts: [] }); },
}));
export const feedback = {
  confirm: (options: { title: string; message: string; tone?: 'normal' | 'danger'; confirmLabel?: string; cancelLabel?: string }) => { const language = useUiStore.getState().language; return new Promise<boolean>((resolve) => useFeedbackStore.getState().enqueue({ id: id(), type: 'confirm', title: options.title, message: options.message, tone: options.tone ?? 'normal', confirmLabel: options.confirmLabel ?? t(language, 'feedback.continueLabel'), cancelLabel: options.cancelLabel ?? t(language, 'feedback.giveUp'), resolve })); },
  prompt: (options: { title: string; message?: string; initialValue?: string; inputLabel?: string; confirmLabel?: string; cancelLabel?: string }) => { const language = useUiStore.getState().language; return new Promise<string | null>((resolve) => useFeedbackStore.getState().enqueue({ id: id(), type: 'prompt', title: options.title, message: options.message, initialValue: options.initialValue ?? '', inputLabel: options.inputLabel ?? t(language, 'feedback.valueLabel'), confirmLabel: options.confirmLabel ?? t(language, 'feedback.save'), cancelLabel: options.cancelLabel ?? t(language, 'feedback.giveUp'), resolve })); },
  choose: <T extends string>(options: { title: string; message: string; choices: Array<{ value: T; label: string; tone?: 'normal' | 'danger' }>; cancelLabel?: string }) => { const language = useUiStore.getState().language; return new Promise<T | null>((resolve) => useFeedbackStore.getState().enqueue({ id: id(), type: 'choice', title: options.title, message: options.message, choices: options.choices, cancelLabel: options.cancelLabel ?? t(language, 'feedback.cancel'), resolve: (value) => resolve(value as T | null) })); },
  toast: (message: string, tone: ToastTone = 'info') => useFeedbackStore.getState().pushToast(message, tone),
};
