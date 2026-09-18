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

// @desc   Get public landing statistics & active program counts
// @route  GET /api/scholarships/public-stats
const getPublicStats = async (req, res) => {
  try {
    const scholarships = await scholarshipModel.findAll();
    const activePrograms = scholarships.filter((s) => s.status === 'Open' || s.status === 'Active');

    let maxGrant = 160000;
    scholarships.forEach((s) => {
      const grantVal = parseFloat(String(s.amount || s.total_max || '').replace(/[^0-9.]/g, ''));
      if (grantVal && grantVal > maxGrant) maxGrant = grantVal;
    });

    let totalScholars = 50000;
    try {
      const { pool } = require('../config/db');
      const countRes = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status IN ('approved', 'granted', 'disbursed', 'active')");
      const appCount = parseInt(countRes.rows[0]?.count || '0', 10);
      totalScholars += appCount;
    } catch (_) {}

    res.json({
      success: true,
      totalScholars: totalScholars.toLocaleString() + '+',
      maxGrant: `₱${maxGrant.toLocaleString()}`,
      digitalProcessing: '100%',
      activeProgramsCount: activePrograms.length || 12,
      totalProgramsCount: scholarships.length || 16,
      partnerSchoolsCount: '38+',
    });
  } catch (error) {
    console.error('[scholarshipController] getPublicStats error:', error);
    res.json({
      success: true,
      totalScholars: '50,000+',
      maxGrant: '₱160,000',
      digitalProcessing: '100%',
      activeProgramsCount: 12,
      totalProgramsCount: 16,
      partnerSchoolsCount: '38+',
    });
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

module.exports = { getScholarships, getScholarship, updateStatus, createScholarship, getPublicStats };

