// backend/controllers/workStudyController.js
const workStudyModel = require('../models/workStudyModel');

// @desc   Get all available work-study jobs
// @route  GET /api/work-study/jobs
const getJobs = async (req, res) => {
  try {
    const filters = {
      department: req.query.department,
      status: req.query.status,
      search: req.query.search,
    };
    const jobs = await workStudyModel.getJobs(filters);
    res.json(jobs);
  } catch (error) {
    console.error('[workStudyController] getJobs error:', error);
    res.status(500).json({ message: 'Failed to fetch work-study opportunities' });
  }
};

// @desc   Get single work-study job details
// @route  GET /api/work-study/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await workStudyModel.getJobById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Work-study opportunity not found' });
    res.json(job);
  } catch (error) {
    console.error('[workStudyController] getJobById error:', error);
    res.status(500).json({ message: 'Failed to fetch work-study opportunity' });
  }
};

// @desc   Create a new work-study job opportunity
// @route  POST /api/work-study/jobs
const createJob = async (req, res) => {
  try {
    if (!req.body.title || !req.body.department || !req.body.description) {
      return res.status(400).json({ message: 'Title, department, and description are required.' });
    }
    const job = await workStudyModel.createJob(req.body);
    res.status(201).json(job);
  } catch (error) {
    console.error('[workStudyController] createJob error:', error);
    res.status(500).json({ message: 'Failed to create work-study opportunity' });
  }
};

// @desc   Log work-study hours for a student
// @route  POST /api/work-study/logs
const logHours = async (req, res) => {
  try {
    const { job_id, work_date, clock_in, clock_out, hours_logged, tasks_completed, application_id } = req.body;
    if (!job_id || !clock_in || !clock_out || !hours_logged || !tasks_completed) {
      return res.status(400).json({ message: 'Job, time, hours logged, and tasks completed are required.' });
    }

    const userId = req.user ? req.user.id : (req.body.user_id || 1);
    const newLog = await workStudyModel.logHours({
      application_id,
      user_id: userId,
      job_id,
      work_date,
      clock_in,
      clock_out,
      hours_logged,
      tasks_completed,
    });
    res.status(201).json(newLog);
  } catch (error) {
    console.error('[workStudyController] logHours error:', error);
    res.status(500).json({ message: 'Failed to record work-study log' });
  }
};

// @desc   Get work-study logs (for supervisors or student self)
// @route  GET /api/work-study/logs
const getLogs = async (req, res) => {
  try {
    const filters = {
      user_id: req.query.user_id,
      job_id: req.query.job_id,
      status: req.query.status,
    };
    if (req.user && req.user.role === 'student') {
      filters.user_id = req.user.id;
    }
    const logs = await workStudyModel.getLogs(filters);
    res.json(logs);
  } catch (error) {
    console.error('[workStudyController] getLogs error:', error);
    res.status(500).json({ message: 'Failed to fetch work-study logs' });
  }
};

// @desc   Approve or reject a student work-study time log
// @route  PUT /api/work-study/logs/:id/status
const updateLogStatus = async (req, res) => {
  try {
    const { status, supervisor_remarks } = req.body;
    if (!status || !['Approved', 'Rejected', 'Pending Approval'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const approvedBy = req.user ? req.user.id : null;
    const updatedLog = await workStudyModel.updateLogStatus(req.params.id, status, supervisor_remarks, approvedBy);
    if (!updatedLog) return res.status(404).json({ message: 'Time log entry not found.' });

    res.json(updatedLog);
  } catch (error) {
    console.error('[workStudyController] updateLogStatus error:', error);
    res.status(500).json({ message: 'Failed to update time log status' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  logHours,
  getLogs,
  updateLogStatus,
};
