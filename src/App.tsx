import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/views/Layout';
import { AnalyticsTab } from '@/views/AnalyticsTab';
import { BodyTab } from '@/views/BodyTab';
import { CaloriesTab } from '@/views/CaloriesTab';
import { CycleTab } from '@/views/CycleTab';
import { GuideTab } from '@/views/GuideTab';
import { TrainingTab } from '@/views/TrainingTab';
import { ExercisesTab } from '@/views/ExercisesTab';
import { PlanHub } from '@/views/PlanHub';
import { ProfileTab } from '@/views/ProfileTab';
import { ProgressHub } from '@/views/ProgressHub';
import { NutritionTab } from '@/views/NutritionTab';
import { ProgressTab } from '@/views/ProgressTab';
import { RecordsTab } from '@/views/RecordsTab';
import { StyleGuide } from '@/views/StyleGuide';
import { WorkoutTab } from '@/views/WorkoutTab';

function App() {
  return (
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
  );
}

export default App;
