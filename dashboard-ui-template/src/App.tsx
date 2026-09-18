import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  const [activeRole, setActiveRole] = useState('student');

  return (
    <AppLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DashboardPage role={activeRole} />
    </AppLayout>
  );
}

export default App;
