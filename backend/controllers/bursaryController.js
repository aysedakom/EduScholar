// backend/controllers/bursaryController.js
const bursaryModel = require('../models/bursaryModel');

// @desc   Get all bursaries
// @route  GET /api/bursaries
const getBursaries = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      search: req.query.search,
    };
    const bursaries = await bursaryModel.findAll(filters);
    res.json(bursaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get single bursary
// @route  GET /api/bursaries/:id
const getBursary = async (req, res) => {
  try {
    const bursary = await bursaryModel.findById(req.params.id);
    if (!bursary) return res.status(404).json({ message: 'Bursary not found' });
    res.json(bursary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Create a bursary
// @route  POST /api/bursaries
const createBursary = async (req, res) => {
  try {
    const bursary = await bursaryModel.create(req.body);
    res.status(201).json(bursary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBursaries, getBursary, createBursary };
