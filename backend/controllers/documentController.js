// backend/controllers/documentController.js
const documentModel = require('../models/documentModel');

// @desc   Get documents (role-aware: student gets own, admin can query all or by userId/applicationId)
// @route  GET /api/documents
const getMyDocuments = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      if (req.query.applicationId) {
        const docs = await documentModel.findByApplication(req.query.applicationId);
        return res.json(docs);
      }
      if (req.query.userId) {
        const docs = await documentModel.findByUser(Number(req.query.userId));
        return res.json(docs);
      }
      const allDocs = await documentModel.findAll(req.query);
      return res.json(allDocs);
    }

    const documents = await documentModel.findByUser(req.user.id);
    res.json(documents);
  } catch (error) {
    console.error('[documentController] getMyDocuments error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

// @desc   Upload a document (metadata + optional fileData)
// @route  POST /api/documents
const createDocument = async (req, res) => {
  try {
    const { name, category, size, expiryDate, applicationId, fileData, mimeType, filePath } = req.body;
    const document = await documentModel.create({
      user_id: req.user.id,
      application_id: applicationId || null,
      name,
      category,
      size: size || '1.2 MB',
      file_data: fileData || null,
      file_path: filePath || null,
      mime_type: mimeType || 'application/pdf',
      expiry_date: expiryDate || null,
    });
    res.status(201).json(document);
  } catch (error) {
    console.error('[documentController] createDocument error:', error);
    res.status(500).json({ message: 'Server error uploading document' });
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
    console.error('[documentController] deleteDocument error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
};

module.exports = { getMyDocuments, createDocument, deleteDocument };
