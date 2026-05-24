import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardView, Layout } from '@/views/Layout';
import { StyleGuide } from '@/views/StyleGuide';

const views = {
  workout: {
    eyebrow: 'Workout Log',
    title: 'Today',
    summary: 'Review the current training day and prepare the logging flow for the next prompt.',
    panels: [
      { title: 'Set List', body: 'Daily workout sets will render here after the logging view lands.' },
      { title: 'Quick Stats', body: 'Volume, effort, and session totals share the dashboard grid.' },
      { title: 'Rest Timer', body: 'Timer controls will attach to this layout without changing routes.' }
    ]
  },
  records: {
    eyebrow: 'Personal Records',
    title: 'PRs',
    summary: 'Track one-rep max, volume, and weight-at-reps records across exercises.',
    panels: [
      { title: 'Recent Records', body: 'New personal records from the store will appear here.' },
      { title: 'Top Lifts', body: 'Exercise-specific highlights use the same responsive panels.' },
      { title: 'Record Types', body: '1RM, volume, and weight-at-reps records stay grouped.' }
    ]
  },
  analytics: {
    eyebrow: 'Training Volume',
    title: 'Volume',
    summary: 'Analyze total work by muscle group, exercise, and training window.',
    panels: [
      { title: 'Muscle Groups', body: 'Volume charts will use this wide dashboard grid.' },
      { title: 'Weekly Load', body: 'Desktop screens expose multiple analytics panels at once.' },
      { title: 'Session Mix', body: 'Mobile keeps the same content in a single scroll column.' }
    ]
  },
  exercises: {
    eyebrow: 'Exercise Library',
    title: 'Library',
    summary: 'Browse default and custom exercises with muscle groups, equipment, and cues.',
    panels: [
      { title: 'Default Exercises', body: 'Seeded Dexie exercises populate this list.' },
      { title: 'Filters', body: 'Type, muscle group, and equipment filters will sit in-panel.' },
      { title: 'History', body: 'Exercise detail history can route inside this shell.' }
    ]
  },
  progress: {
    eyebrow: 'Progress Trends',
    title: 'Trends',
    summary: 'Follow weight, reps, and estimated strength trends over time.',
    panels: [
      { title: 'Strength Trend', body: 'Line charts will render without changing navigation.' },
      { title: 'Rep Progress', body: 'Progress panels share the same multi-column desktop behavior.' },
      { title: 'Exercise Focus', body: 'Custom exercise trends stay reachable from history routes.' }
    ]
  }
};

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<DashboardView {...views.workout} />} path="/" />
        <Route element={<DashboardView {...views.records} />} path="/records" />
        <Route element={<DashboardView {...views.analytics} />} path="/analytics" />
        <Route element={<DashboardView {...views.exercises} />} path="/exercises" />
        <Route element={<DashboardView {...views.progress} />} path="/progress" />
      </Route>
      <Route element={<StyleGuide />} path="/styleguide" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;
