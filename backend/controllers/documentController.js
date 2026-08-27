// backend/controllers/documentController.js
const documentModel = require('../models/documentModel');

// @desc   Get documents (role-aware: student gets own, admin can query by userId/applicationId)
// @route  GET /api/documents
const getMyDocuments = async (req, res) => {
  try {
    const targetUserId = (req.user.role !== 'student' && req.query.userId) 
      ? Number(req.query.userId) 
      : req.user.id;
    const documents = await documentModel.findByUser(targetUserId);
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Upload a document (metadata)
// @route  POST /api/documents
const createDocument = async (req, res) => {
  try {
    const { name, category, size, expiryDate } = req.body;
    const document = await documentModel.create({
      user_id: req.user.id,
      name,
      category,
      size: size || '1.2 MB',
      expiry_date: expiryDate || null,
    });
    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Delete a document
// @route  DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const removed = await documentModel.remove(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted', id: removed.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyDocuments, createDocument, deleteDocument };
