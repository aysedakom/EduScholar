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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Create a scholarship (staff/admin)
// @route  POST /api/scholarships
const createScholarship = async (req, res) => {
  try {
    const scholarship = await scholarshipModel.create(req.body);
    res.status(201).json(scholarship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getScholarships, getScholarship, createScholarship };
