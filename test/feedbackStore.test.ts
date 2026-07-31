import { beforeEach, describe, expect, it } from 'vitest';
import { feedback, useFeedbackStore } from '../src/stores/feedbackStore';
describe('central feedback', () => {
  beforeEach(() => useFeedbackStore.getState().reset());
  it('serializes dialogs and resolves their promises safely', async () => { const first = feedback.confirm({ title: 'Birinci', message: 'İlk onay' }); const second = feedback.prompt({ title: 'İkinci', initialValue: 'Taslak' }); expect(useFeedbackStore.getState().active?.title).toBe('Birinci'); expect(useFeedbackStore.getState().queue).toHaveLength(1); useFeedbackStore.getState().settle(true); await expect(first).resolves.toBe(true); expect(useFeedbackStore.getState().active?.title).toBe('İkinci'); useFeedbackStore.getState().settle('Yeni ad'); await expect(second).resolves.toBe('Yeni ad'); expect(useFeedbackStore.getState().active).toBeUndefined(); });
  it('keeps at most the three newest typed toasts', () => { feedback.toast('Bir'); feedback.toast('İki'); feedback.toast('Üç'); feedback.toast('Dört', 'success'); expect(useFeedbackStore.getState().toasts).toHaveLength(3); expect(useFeedbackStore.getState().toasts.map((toast) => toast.message)).toEqual(['İki', 'Üç', 'Dört']); });
});
