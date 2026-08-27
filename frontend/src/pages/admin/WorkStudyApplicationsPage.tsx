import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const WorkStudyApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/admin/scholarships', { replace: true });
  }, [navigate]);

  return null;
};

export default WorkStudyApplicationsPage;
