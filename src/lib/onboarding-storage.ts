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
    const parsed = JSON.parse(raw);
    // Ensure numeric values are properly converted
    if (parsed.weight !== undefined && parsed.weight !== null && parsed.weight !== '') {
      const weightNum = Number(parsed.weight);
      if (!isNaN(weightNum)) parsed.weight = weightNum;
    }
    if (parsed.targetWeight !== undefined && parsed.targetWeight !== null && parsed.targetWeight !== '') {
      const targetWeightNum = Number(parsed.targetWeight);
      if (!isNaN(targetWeightNum)) parsed.targetWeight = targetWeightNum;
    }
    if (parsed.height !== undefined && parsed.height !== null && parsed.height !== '') {
      const heightNum = Number(parsed.height);
      if (!isNaN(heightNum)) parsed.height = heightNum;
    }
    if (parsed.age !== undefined && parsed.age !== null && parsed.age !== '') {
      const ageNum = Number(parsed.age);
      if (!isNaN(ageNum)) parsed.age = ageNum;
    }
    return parsed;
  } catch {
    return {};
  }
}

export function clearOnboardingData() {
  localStorage.removeItem(STORAGE_KEY);
}
