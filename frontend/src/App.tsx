import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { BOQEditor } from '@/pages/BOQEditor';
import { RateLibrary } from '@/pages/RateLibrary';
import { Analysis } from '@/pages/Analysis';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="boq-editor" element={<BOQEditor />} />
          <Route path="rate-library" element={<RateLibrary />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
