// Utility für lokales Onboarding-Daten-Management (localStorage)

export type OnboardingData = {
  height?: number;
  weight?: number;
  targetWeight?: number;
  userGoals?: string[];
  birthDate?: string;
  gender?: string;
  age?: number;
  activityLevel?: string;
  goal?: string;
  onboardingStep?: number;
  firstName?: string;
  lastName?: string;
  dietType?: string;
  isGlutenfree?: boolean;
};

const STORAGE_KEY = 'trackfood_onboarding';

export function saveOnboardingData(data: Partial<OnboardingData>) {
  const existing = getOnboardingData();
  const merged = { ...existing, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function getOnboardingData(): OnboardingData {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function clearOnboardingData() {
  localStorage.removeItem(STORAGE_KEY);
}
