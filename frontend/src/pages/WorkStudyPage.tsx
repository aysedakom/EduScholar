import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const WorkStudyPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/scholarships', { replace: true });
  }, [navigate]);

  return null;
};

export default WorkStudyPage;
