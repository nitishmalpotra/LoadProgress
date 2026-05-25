import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/views/Layout';
import { AnalyticsTab } from '@/views/AnalyticsTab';
import { ExercisesTab } from '@/views/ExercisesTab';
import { ProgressTab } from '@/views/ProgressTab';
import { RecordsTab } from '@/views/RecordsTab';
import { StyleGuide } from '@/views/StyleGuide';
import { WorkoutTab } from '@/views/WorkoutTab';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<WorkoutTab />} path="/" />
        <Route element={<RecordsTab />} path="/records" />
        <Route element={<AnalyticsTab />} path="/analytics" />
        <Route element={<ExercisesTab />} path="/exercises" />
        <Route element={<ExercisesTab />} path="/exercises/:exerciseId" />
        <Route element={<ProgressTab />} path="/progress" />
      </Route>
      <Route element={<StyleGuide />} path="/styleguide" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;
