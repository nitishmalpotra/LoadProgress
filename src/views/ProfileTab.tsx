import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { ActivityLevel, DietStyle, Goal, Profile, Sex } from '@/models';
import { useProfileStore } from '@/store/useProfileStore';
import styles from '@/views/styles/Profile.module.css';

const kgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
const lbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;
const cmToIn = (cm: number) => Math.round(cm * 0.393701 * 10) / 10;
const inToCm = (inches: number) => Math.round((inches / 0.393701) * 10) / 10;

type FormState = {
  unitSystem: 'metric' | 'imperial';
  weight: string;
  height: string;
  age: string;
  sex: Sex;
  goal: Goal;
  activityLevel: ActivityLevel;
  dietStyle: DietStyle;
  location: string;
  trainingDaysPerWeek: string;
  trainingMinutesPerSession: string;
  cycleTrackingOptIn: boolean;
};

const defaults: FormState = {
  unitSystem: 'metric',
  weight: '',
  height: '',
  age: '',
  sex: 'male',
  goal: 'recomposition',
  activityLevel: 'moderate',
  dietStyle: 'standard',
  location: '',
  trainingDaysPerWeek: '4',
  trainingMinutesPerSession: '60',
  cycleTrackingOptIn: false
};

function profileToForm(profile: Profile): FormState {
  const imperial = profile.unitSystem === 'imperial';
  return {
    unitSystem: profile.unitSystem,
    weight: imperial ? String(kgToLb(profile.weight)) : String(profile.weight),
    height: imperial ? String(cmToIn(profile.height)) : String(profile.height),
    age: String(profile.age),
    sex: profile.sex,
    goal: profile.goal,
    activityLevel: profile.activityLevel,
    dietStyle: profile.dietStyle,
    location: profile.location ?? '',
    trainingDaysPerWeek: String(profile.trainingDaysPerWeek),
    trainingMinutesPerSession: String(profile.trainingMinutesPerSession),
    cycleTrackingOptIn: profile.cycleTrackingOptIn
  };
}

function formToProfile(form: FormState): Omit<Profile, 'id'> {
  const imperial = form.unitSystem === 'imperial';
  const rawWeight = Number(form.weight);
  const rawHeight = Number(form.height);
  return {
    unitSystem: form.unitSystem,
    weight: imperial ? lbToKg(rawWeight) : rawWeight,
    height: imperial ? inToCm(rawHeight) : rawHeight,
    age: Number(form.age),
    sex: form.sex,
    goal: form.goal,
    activityLevel: form.activityLevel,
    dietStyle: form.dietStyle,
    location: form.location.trim() || undefined,
    trainingDaysPerWeek: Number(form.trainingDaysPerWeek),
    trainingMinutesPerSession: Number(form.trainingMinutesPerSession),
    cycleTrackingOptIn: form.cycleTrackingOptIn
  };
}

function toggleUnit(form: FormState): FormState {
  const toImperial = form.unitSystem === 'metric';
  const rawWeight = Number(form.weight);
  const rawHeight = Number(form.height);
  return {
    ...form,
    unitSystem: toImperial ? 'imperial' : 'metric',
    weight: rawWeight
      ? String(toImperial ? kgToLb(rawWeight) : lbToKg(rawWeight))
      : form.weight,
    height: rawHeight
      ? String(toImperial ? cmToIn(rawHeight) : inToCm(rawHeight))
      : form.height
  };
}

const sexOptions: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

const goalOptions: { value: Goal; label: string }[] = [
  { value: 'lose', label: 'Lose fat' },
  { value: 'recomposition', label: 'Recomp' },
  { value: 'gain', label: 'Gain muscle' }
];

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'very_active', label: 'Very active' }
];

const dietOptions: { value: DietStyle; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' }
];

export function ProfileTab() {
  const profile = useProfileStore((s) => s.profile);
  const isLoading = useProfileStore((s) => s.isLoading);
  const saveProfile = useProfileStore((s) => s.saveProfile);

  const [form, setForm] = useState<FormState>(defaults);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm(profileToForm(profile));
  }, [profile]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSaved(false);
    try {
      await saveProfile(formToProfile(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const weightUnit = form.unitSystem === 'metric' ? 'kg' : 'lb';
  const heightUnit = form.unitSystem === 'metric' ? 'cm' : 'in';
  const isEditing = Boolean(profile);

  if (isLoading) {
    return (
      <section className={styles.profilePage} aria-labelledby="profile-title">
        <header className={styles.pageHeader}>
          <h1 id="profile-title">Profile</h1>
        </header>
        <p>Loading…</p>
      </section>
    );
  }

  return (
    <section className={styles.profilePage} aria-labelledby="profile-title">
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Your Stats</p>
        <h1 id="profile-title">Profile</h1>
        <p>{isEditing ? 'Edit your profile below.' : 'Fill in your stats to unlock your plan.'}</p>
      </header>

      <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
        {/* Units */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>Units</span>
          <div className={styles.segmentedRow}>
            <button
              className={form.unitSystem === 'metric' ? styles.segmentSelected : styles.segment}
              type="button"
              onClick={() => setForm(toggleUnit({ ...form, unitSystem: 'imperial' }))}
            >
              Metric (kg / cm)
            </button>
            <button
              className={form.unitSystem === 'imperial' ? styles.segmentSelected : styles.segment}
              type="button"
              onClick={() => setForm(toggleUnit({ ...form, unitSystem: 'metric' }))}
            >
              Imperial (lb / in)
            </button>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Body */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="weight">
            Weight ({weightUnit})
          </label>
          <div className={styles.inputWithToggle}>
            <input
              className={styles.input}
              id="weight"
              inputMode="decimal"
              min="1"
              placeholder={weightUnit === 'kg' ? '70' : '154'}
              required
              type="number"
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
            />
            <button
              className={styles.unitToggle}
              type="button"
              onClick={() => setForm(toggleUnit(form))}
            >
              {weightUnit}
            </button>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="height">
            Height ({heightUnit})
          </label>
          <div className={styles.inputWithToggle}>
            <input
              className={styles.input}
              id="height"
              inputMode="decimal"
              min="1"
              placeholder={heightUnit === 'cm' ? '175' : '69'}
              required
              type="number"
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
            />
            <button
              className={styles.unitToggle}
              type="button"
              onClick={() => setForm(toggleUnit(form))}
            >
              {heightUnit}
            </button>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="age">
            Age
          </label>
          <input
            className={styles.input}
            id="age"
            inputMode="numeric"
            min="10"
            max="100"
            placeholder="30"
            required
            type="number"
            value={form.age}
            onChange={(e) => set('age', e.target.value)}
          />
        </div>

        <hr className={styles.divider} />

        {/* Sex */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>Sex</span>
          <div className={styles.segmentedRow}>
            {sexOptions.map(({ value, label }) => (
              <button
                className={form.sex === value ? styles.segmentSelected : styles.segment}
                key={value}
                type="button"
                onClick={() => set('sex', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cycle tracking — only when female */}
        {form.sex === 'female' && (
          <label className={styles.checkboxRow}>
            <input
              checked={form.cycleTrackingOptIn}
              type="checkbox"
              onChange={(e) => set('cycleTrackingOptIn', e.target.checked)}
            />
            Enable cycle tracking
          </label>
        )}

        <hr className={styles.divider} />

        {/* Goal */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>Goal</span>
          <div className={styles.segmentedRow}>
            {goalOptions.map(({ value, label }) => (
              <button
                className={form.goal === value ? styles.segmentSelected : styles.segment}
                key={value}
                type="button"
                onClick={() => set('goal', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity level */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>Activity level</span>
          <div className={styles.segmentedRow}>
            {activityOptions.map(({ value, label }) => (
              <button
                className={form.activityLevel === value ? styles.segmentSelected : styles.segment}
                key={value}
                type="button"
                onClick={() => set('activityLevel', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Training */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="trainingDays">
            Training days per week
          </label>
          <input
            className={styles.input}
            id="trainingDays"
            inputMode="numeric"
            max="7"
            min="1"
            placeholder="4"
            required
            type="number"
            value={form.trainingDaysPerWeek}
            onChange={(e) => set('trainingDaysPerWeek', e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="trainingMinutes">
            Minutes per session
          </label>
          <input
            className={styles.input}
            id="trainingMinutes"
            inputMode="numeric"
            min="10"
            placeholder="60"
            required
            type="number"
            value={form.trainingMinutesPerSession}
            onChange={(e) => set('trainingMinutesPerSession', e.target.value)}
          />
        </div>

        <hr className={styles.divider} />

        {/* Diet & location */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="diet">
            Diet style
          </label>
          <select
            className={styles.select}
            id="diet"
            value={form.dietStyle}
            onChange={(e) => set('dietStyle', e.target.value as DietStyle)}
          >
            {dietOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="location">
            Location{' '}
            <span className={styles.sublabel}>(optional)</span>
          </label>
          <input
            className={styles.input}
            id="location"
            placeholder="City or region"
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
          />
        </div>

        <button className={styles.saveButton} disabled={isSaving} type="submit">
          <Check size={17} />
          {isSaving ? 'Saving…' : isEditing ? 'Update profile' : 'Save profile'}
        </button>

        {saved && (
          <div className={styles.savedNotice} role="status">
            <Check size={15} />
            Profile saved
          </div>
        )}
      </form>
    </section>
  );
}
