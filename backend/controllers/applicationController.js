// backend/controllers/applicationController.js
const applicationModel = require('../models/applicationModel');
const { pool } = require('../config/db');

// @desc   Get applications (role-aware: student gets own, admin/staff get all)
// @route  GET /api/applications
const getMyApplications = async (req, res) => {
  try {
    const filters = { status: req.query.status, type: req.query.type };
    if (req.user.role !== 'student') {
      const allApps = await applicationModel.findAll(filters);
      return res.json(allApps);
    }
    const applications = await applicationModel.findByUser(req.user.id, filters);
    res.json(applications);
  } catch (error) {
    console.error('[applicationController] getMyApplications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// @desc   Get single application details
// @route  GET /api/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await applicationModel.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Only owner or admin can view
    if (req.user.role === 'student' && application.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to application' });
    }
    res.json(application);
  } catch (error) {
    console.error('[applicationController] getApplicationById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Submit a new scholarship/aid application
// @route  POST /api/applications
const createApplication = async (req, res) => {
  try {
    // Validate portal open status for student submissions
    if (req.user?.role === 'student') {
      const portalSettingsModel = require('../models/portalSettingsModel');
      const portalSettings = await portalSettingsModel.getPortalSettings();
      if (!portalSettings.isOpen) {
        return res.status(403).json({
          success: false,
          message: portalSettings.closedMessage || 'The Scholarship Application Portal is currently closed for new submissions.',
          portalSettings,
        });
      }
    }

    const {
      type, programId, programName, referenceId, title, amount,
      progress, requirementsCount, completedRequirements, jobId, notes,
      formData, documentsSubmitted, remarks
    } = req.body;

    const application = await applicationModel.create({
      user_id: req.user.id,
      type: type || 'Scholarship',
      program_id: programId || 'tertiary-academic',
      program_name: programName || title || 'Quezon City Scholarship Program (QCSP)',
      reference_id: referenceId || null,
      title: title || programName || 'Scholarship Application',
      amount: amount || 0,
      status: 'Under Review',
      submission_date: new Date().toISOString().split('T')[0],
      progress: progress || 50,
      requirements_count: requirementsCount || 4,
      completed_requirements: completedRequirements || 4,
      job_id: jobId || null,
      notes: notes || null,
      form_data: formData || req.body,
      documents_submitted: documentsSubmitted || [],
      remarks: remarks || 'Application submitted via student portal. Verification in progress.',
    });

    // 1. Synchronize user profile fields with submitted form data
    if (formData && req.user && req.user.id) {
      try {
        const studentName = formData.firstName && formData.lastName
          ? `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}${formData.suffix && formData.suffix !== 'NA' ? ' ' + formData.suffix : ''}`.trim()
          : null;

        await pool.query(
          `UPDATE users 
           SET name = COALESCE($1, name),
               student_id = COALESCE($2, student_id),
               department = COALESCE($3, department),
               major = COALESCE($4, major),
               gpa = COALESCE($5, gpa),
               phone = COALESCE($6, phone),
               address = COALESCE($7, address),
               barangay = COALESCE($8, barangay),
               city = COALESCE($9, city)
           WHERE id = $10`,
          [
            studentName,
            formData.studentId || null,
            formData.school || formData.department || null,
            formData.course || formData.major || null,
            formData.gpa ? Number(formData.gpa) : null,
            formData.mobileNumber || formData.phone || null,
            formData.address || null,
            formData.barangay || null,
            formData.city || null,
            req.user.id
          ]
        );
      } catch (userUpdErr) {
        console.warn('[applicationController] User profile update note:', userUpdErr.message);
      }
    }

    // 2. Insert submitted attachments into documents database table
    if (Array.isArray(documentsSubmitted) && documentsSubmitted.length > 0 && req.user && req.user.id) {
      try {
        for (const doc of documentsSubmitted) {
          let mimeType = 'application/pdf';
          const docName = doc.name || 'Attachment.pdf';
          if (docName.endsWith('.jfif') || docName.endsWith('.jpg') || docName.endsWith('.jpeg') || docName.endsWith('.png')) {
            mimeType = 'image/jpeg';
          } else if (docName.endsWith('.json')) {
            mimeType = 'application/json';
          } else if (docName.endsWith('.md') || docName.endsWith('.txt')) {
            mimeType = 'text/plain';
          }

          await pool.query(
            `INSERT INTO documents (user_id, application_id, name, category, upload_date, status, size, file_path, file_data, mime_type)
             VALUES ($1, $2, $3, $4, CURRENT_DATE, 'verified', $5, $6, $7, $8)
             ON CONFLICT DO NOTHING`,
            [
              req.user.id,
              application.id,
              doc.name || 'Submitted_Attachment.pdf',
              doc.id || doc.category || 'application_attachment',
              doc.size || '1.0 MB',
              doc.filePath || `/uploads/${doc.name}`,
              doc.fileData || doc.dataUrl || null,
              mimeType
            ]
          );
        }
      } catch (docErr) {
        console.warn('[applicationController] Documents insert note:', docErr.message);
      }
    }

    // 3. Dispatch real-time notification to applicant and staff/admin users
    try {
      // 3a. Applicant notification
      if (req.user && req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
           VALUES ($1, $2, $3, 'success', false, 'application_status', '/applications')`,
          [
            req.user.id,
            `Application Submitted: ${application.title || application.program_name}`,
            `Your application for ${application.program_name} (Ref: ${application.application_code || application.reference_id || 'QCSP'}) has been successfully submitted and queued for verification.`
          ]
        );
      }

      // 3b. Staff/Admin notifications
      const adminUsers = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'system_admin', 'school_coordinator')");
      for (const admin of adminUsers.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
           VALUES ($1, $2, $3, 'info', false, 'application_status', '/admin/review-queue')`,
          [
            admin.id,
            `New Application: ${application.title || application.program_name}`,
            `Applicant ${formData?.firstName || req.user.name || 'Student'} (${req.user.email || 'student@qc.gov.ph'}) submitted an application for ${application.program_name}.`
          ]
        );
      }

      // 3c. WebSocket broadcast
      try {
        const { broadcast } = require('../realtime/socketServer');
        broadcast({
          type: 'DB_EVENT',
          channel: 'eduscholar_events',
          table: 'applications',
          action: 'INSERT',
          record: application,
          timestamp: new Date().toISOString(),
        });
      } catch (wsErr) {
        // ws optional
      }
    } catch (notifErr) {
      console.warn('[applicationController] Notification error:', notifErr.message);
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('[applicationController] createApplication error:', error);
    res.status(500).json({ message: 'Failed to submit application: ' + error.message });
  }
};

// @desc   Update application review status (staff/admin)
// @route  PATCH /api/applications/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status, notes, remarks } = req.body;
    const application = await applicationModel.updateStatus(req.params.id, status, notes, remarks);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (error) {
    console.error('[applicationController] updateStatus error:', error);
    res.status(500).json({ message: 'Server error updating application status' });
  }
};

// @desc   Forward/Send Official Award Certificate to Student Email
// @route  POST /api/applications/:id/send-certificate
const sendAwardCertificate = async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const { pool } = require('../config/db');

    const appRes = await pool.query(
      `SELECT a.*, u.name as user_name, u.email as user_email, u.student_id as user_student_id, u.department as user_dept, u.major as user_major
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (!appRes.rows || appRes.rows.length === 0) {
      return res.status(404).json({ message: 'Application or applicant not found' });
    }

    const app = appRes.rows[0];
    const formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
    const studentName = app.user_name || `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Student';
    const studentEmail = app.user_email || formData.email;
    const studentId = app.user_student_id || formData.studentId || `2026-${String(app.user_id).padStart(5, '0')}`;
    const school = formData.school || app.user_dept || 'Quezon City University (QCU)';
    const course = formData.course || app.user_major || 'B.S. Information Technology';
    const programName = app.title || app.program_name || 'Quezon City Scholarship Program';
    const grantAmount = Number(app.amount) || 20000;
    const certNumber = `QCSP-AWARD-2026-${String(app.id).padStart(5, '0')}`;
    const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const result = await emailService.sendScholarshipAwardCertificateEmail({
      to: studentEmail,
      name: studentName,
      studentId,
      programTitle: programName,
      awardAmount: grantAmount,
      certificateNumber: certNumber,
      school,
      course,
      issueDate,
    });

    res.json({
      success: true,
      message: `Official Award Certificate successfully sent to ${studentEmail}`,
      certificateNumber: certNumber,
      recipientEmail: studentEmail,
      method: result.method,
    });
  } catch (error) {
    console.error('[applicationController] sendAwardCertificate error:', error);
    res.status(500).json({ message: 'Failed to dispatch certificate email: ' + error.message });
  }
};

module.exports = { getMyApplications, getApplicationById, createApplication, updateStatus, sendAwardCertificate };

