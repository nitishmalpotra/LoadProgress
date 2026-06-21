import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/views/Layout';
import { PlanHub } from '@/views/PlanHub';
import { ProgressHub } from '@/views/ProgressHub';
import { WorkoutTab } from '@/views/WorkoutTab';

// Lazy-loaded routes keep Recharts and the secondary screens out of the
// initial bundle, so the Today view loads fast.
const AnalyticsTab = lazy(() =>
  import('@/views/AnalyticsTab').then((m) => ({ default: m.AnalyticsTab }))
);
const BodyTab = lazy(() => import('@/views/BodyTab').then((m) => ({ default: m.BodyTab })));
const CaloriesTab = lazy(() =>
  import('@/views/CaloriesTab').then((m) => ({ default: m.CaloriesTab }))
);
const CycleTab = lazy(() => import('@/views/CycleTab').then((m) => ({ default: m.CycleTab })));
const ExercisesTab = lazy(() =>
  import('@/views/ExercisesTab').then((m) => ({ default: m.ExercisesTab }))
);
const GuideTab = lazy(() => import('@/views/GuideTab').then((m) => ({ default: m.GuideTab })));
const NutritionTab = lazy(() =>
  import('@/views/NutritionTab').then((m) => ({ default: m.NutritionTab }))
);
const ProfileTab = lazy(() =>
  import('@/views/ProfileTab').then((m) => ({ default: m.ProfileTab }))
);
const ProgressTab = lazy(() =>
  import('@/views/ProgressTab').then((m) => ({ default: m.ProgressTab }))
);
const RecordsTab = lazy(() =>
  import('@/views/RecordsTab').then((m) => ({ default: m.RecordsTab }))
);
const StyleGuide = lazy(() =>
  import('@/views/StyleGuide').then((m) => ({ default: m.StyleGuide }))
);
const TrainingTab = lazy(() =>
  import('@/views/TrainingTab').then((m) => ({ default: m.TrainingTab }))
);

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<WorkoutTab />} path="/" />
          <Route element={<PlanHub />} path="/plan">
            <Route index element={<Navigate replace to="calories" />} />
            <Route element={<CaloriesTab />} path="calories" />
            <Route element={<TrainingTab />} path="training" />
            <Route element={<NutritionTab />} path="nutrition" />
            <Route element={<CycleTab />} path="cycle" />
            <Route element={<GuideTab />} path="guide" />
          </Route>
          <Route element={<ProgressHub />} path="/progress">
            <Route index element={<Navigate replace to="trends" />} />
            <Route element={<ProgressTab />} path="trends" />
            <Route element={<AnalyticsTab />} path="volume" />
            <Route element={<RecordsTab />} path="records" />
            <Route element={<BodyTab />} path="body" />
          </Route>
          <Route element={<ExercisesTab />} path="/exercises" />
          <Route element={<ExercisesTab />} path="/exercises/:exerciseId" />
          <Route element={<ProfileTab />} path="/profile" />
        </Route>
        <Route element={<StyleGuide />} path="/styleguide" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Suspense>
  );
}

export default App;
