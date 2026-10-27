/**
 * Universal Movers CRM - Multi-Step Intake Autosave & Draft Recovery Utility
 * Provides scoped draft storage, debounced persistence, and recovery handling.
 */

export interface IntakeDraftPayload {
  version: number;
  lastSavedAt: string;
  activeStep: number;
  selectedServices: any[];
  selectedRoom: any[];
  packageData?: any;
  formData: Record<string, any>;
}

export function getDraftKey(type?: string, id?: string): string {
  if (type && id && id !== 'new') {
    return `crm_intake_draft_${type}_${id}`;
  }
  return 'crm_intake_draft_new';
}

export function saveIntakeDraft(key: string, payload: IntakeDraftPayload): void {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save intake draft to localStorage:', error);
  }
}

export function getIntakeDraft(key: string, maxAgeHours = 168): IntakeDraftPayload | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: IntakeDraftPayload = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.lastSavedAt || !parsed.formData) {
      return null;
    }

    // Check expiration (defaults to 7 days = 168 hours)
    const savedTime = new Date(parsed.lastSavedAt).getTime();
    const now = Date.now();
    const ageHours = (now - savedTime) / (1000 * 60 * 60);

    if (isNaN(ageHours) || ageHours > maxAgeHours) {
      clearIntakeDraft(key);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to parse intake draft:', error);
    return null;
  }
}

export function clearIntakeDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove intake draft:', error);
  }
}

export function formatDraftTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'recently';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}
