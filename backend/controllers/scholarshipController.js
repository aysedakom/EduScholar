// backend/controllers/scholarshipController.js
const scholarshipModel = require('../models/scholarshipModel');

// @desc   Get all scholarships
// @route  GET /api/scholarships
const getScholarships = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      search: req.query.search,
    };
    const scholarships = await scholarshipModel.findAll(filters);
    res.json(scholarships);
  } catch (error) {
    console.error('[scholarshipController] getScholarships error:', error);
    res.status(500).json({ message: 'Server error fetching scholarships' });
  }
};

// @desc   Get single scholarship
// @route  GET /api/scholarships/:id
const getScholarship = async (req, res) => {
  try {
    const scholarship = await scholarshipModel.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: 'Scholarship not found' });
    res.json(scholarship);
  } catch (error) {
    console.error('[scholarshipController] getScholarship error:', error);
    res.status(500).json({ message: 'Server error fetching scholarship' });
  }
};

// @desc   Update scholarship status (Open / Closed / Upcoming / Closing Soon)
// @route  PATCH /api/scholarships/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const updated = await scholarshipModel.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Scholarship program not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('[scholarshipController] updateStatus error:', error);
    res.status(500).json({ message: 'Server error updating scholarship status' });
  }
};

// @desc   Create a scholarship (staff/admin)
// @route  POST /api/scholarships
const createScholarship = async (req, res) => {
  try {
    const scholarship = await scholarshipModel.create(req.body);
    res.status(201).json(scholarship);
  } catch (error) {
    console.error('[scholarshipController] createScholarship error:', error);
    res.status(500).json({ message: 'Server error creating scholarship' });
  }
};

module.exports = { getScholarships, getScholarship, updateStatus, createScholarship };
