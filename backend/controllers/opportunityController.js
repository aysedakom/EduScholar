// backend/controllers/opportunityController.js
const opportunityModel = require('../models/opportunityModel');

// @desc   Get all opportunities
// @route  GET /api/opportunities
const getOpportunities = async (req, res) => {
  try {
    const filters = {
      providerType: req.query.providerType,
      status: req.query.status,
      category: req.query.category,
      search: req.query.search,
    };
    const opportunities = await opportunityModel.findAll(filters);
    res.json(opportunities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get single opportunity
// @route  GET /api/opportunities/:id
const getOpportunity = async (req, res) => {
  try {
    const opportunity = await opportunityModel.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opportunity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Create an opportunity (staff/admin)
// @route  POST /api/opportunities
const createOpportunity = async (req, res) => {
  try {
    const opportunity = await opportunityModel.create(req.body);
    res.status(201).json(opportunity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getOpportunities, getOpportunity, createOpportunity };
