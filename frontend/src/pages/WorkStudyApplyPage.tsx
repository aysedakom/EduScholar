import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const WorkStudyApplyPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/apply/scholarship', { replace: true });
  }, [navigate]);

  return null;
};

export default WorkStudyApplyPage;
