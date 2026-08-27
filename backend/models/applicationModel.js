// backend/models/applicationModel.js
const { pool } = require('../config/db');
const emailService = require('../services/emailService');

const findAll = async (filters = {}) => {
  try {
    const clauses = [];
    const values = [];
    let i = 1;

    if (filters.status && filters.status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(filters.status);
    }
    if (filters.type && filters.type !== 'All') {
      clauses.push(`type = $${i++}`);
      values.push(filters.type);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT a.*, u.name as applicant_name, u.email as applicant_email, u.student_id, u.gpa
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       ${where}
       ORDER BY a.submission_date DESC, a.id DESC`,
      values
    );
    return result.rows;
  } catch (err) {
    console.error('[applicationModel] findAll query error:', err.message);
    return [];
  }
};

const findByUser = async (userId, filters = {}) => {
  try {
    const clauses = ['user_id = $1'];
    const values = [userId];
    let i = 2;

    if (filters.status && filters.status !== 'All') {
      clauses.push(`status = $${i++}`);
      values.push(filters.status);
    }
    if (filters.type && filters.type !== 'All') {
      clauses.push(`type = $${i++}`);
      values.push(filters.type);
    }

    const where = clauses.join(' AND ');
    const result = await pool.query(
      `SELECT * FROM applications WHERE ${where} ORDER BY submission_date DESC, id DESC`,
      values
    );
    return result.rows;
  } catch (err) {
    console.error('[applicationModel] findByUser query error:', err.message);
    return [];
  }
};

const findById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as applicant_name, u.email as applicant_email, u.student_id
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('[applicationModel] findById query error:', err.message);
    return null;
  }
};

const create = async (data) => {
  try {
    const applicationCode = data.application_code || `APP-QC-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO applications
         (application_code, user_id, type, program_id, program_name, reference_id, title, amount, status,
          submission_date, disbursement_date, progress, requirements_count, completed_requirements,
          job_id, notes, form_data, documents_submitted, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        applicationCode,
        data.user_id,
        data.type || 'Scholarship',
        data.program_id || null,
        data.program_name || 'Quezon City Scholarship Program',
        data.reference_id || applicationCode,
        data.title || data.program_name,
        data.amount || 0,
        data.status || 'Under Review',
        data.submission_date || new Date().toISOString().split('T')[0],
        data.disbursement_date || null,
        data.progress || 50,
        data.requirements_count || 4,
        data.completed_requirements || 4,
        data.job_id || null,
        data.notes || null,
        JSON.stringify(data.form_data || {}),
        JSON.stringify(data.documents_submitted || []),
        data.remarks || null,
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('[applicationModel] create error:', err.message);
    throw err;
  }
};

const updateStatus = async (id, status, notes, remarks) => {
  try {
    const statusLower = String(status || '').toLowerCase().trim();
    let progress = 33;
    if (statusLower === 'paid' || statusLower === 'disbursed' || statusLower === 'completed' || statusLower === 'released') {
      progress = 100;
    } else if (statusLower === 'approved' || statusLower === 'granted' || statusLower === 'rejected' || statusLower === 'disapproved' || statusLower === 'denied') {
      progress = 83;
    } else if (statusLower === 'interview scheduled' || statusLower === 'assessment' || statusLower === 'screening' || statusLower === 'shortlisted') {
      progress = 66;
    } else if (statusLower === 'eligibility' || statusLower === 'eligible' || statusLower === 'eligibility verified') {
      progress = 50;
    } else if (statusLower === 'submitted' || statusLower === 'draft') {
      progress = 16;
    }

    const result = await pool.query(
      `UPDATE applications 
       SET status = $2, 
           notes = COALESCE($3, notes),
           remarks = COALESCE($4, remarks),
           progress = $5,
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, status, notes || null, remarks || null, progress]
    );

    const updatedApp = result.rows[0];

    // Automatically enroll scholar into registry, generate award certificate, and dispatch email upon Approval
    if (updatedApp && (statusLower === 'approved' || statusLower === 'granted')) {
      try {
        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [updatedApp.user_id]);
        const user = userRes.rows[0];
        if (user) {
          const formData = typeof updatedApp.form_data === 'string' ? JSON.parse(updatedApp.form_data) : (updatedApp.form_data || {});
          const studentId = user.student_id || formData.studentId || `2026-${String(user.id).padStart(5, '0')}`;
          const school = formData.school || user.department || 'Quezon City University (QCU)';
          const course = formData.course || user.major || 'B.S. Information Technology';
          const programId = updatedApp.program_id || 'tertiary-academic';
          const programName = updatedApp.title || updatedApp.program_name || 'Tertiary Academic Scholarship';
          const gwa = Number(formData.gpa || user.gpa || 1.75);
          const grantAmount = Number(updatedApp.amount) || 20000;
          const certNumber = `QCSP-AWARD-2026-${String(updatedApp.id).padStart(5, '0')}`;
          const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          // 1. Insert into student registry
          await pool.query(
            `INSERT INTO student_registry (student_id, user_id, full_name, email, school, program_id, program_name, current_term, scholarship_age, gwa, units_enrolled, status, grant_amount, disbursement_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, '1st Sem AY 2026-2027', 'Year 1 (1st Sem)', $8, 18, 'Active Good Standing', $9, 'Scheduled')
             ON CONFLICT (student_id) DO UPDATE SET 
               user_id = EXCLUDED.user_id,
               status = 'Active Good Standing',
               grant_amount = EXCLUDED.grant_amount`,
            [studentId, user.id, user.name, user.email, school, programId, programName, gwa, grantAmount]
          );

          // 2. Insert into education monitoring reports
          await pool.query(
            `INSERT INTO education_monitoring_reports (audit_code, student_id, name, email, avatar, barangay, school, program, semester_aid_amount, current_term, current_gwa, units_enrolled, units_passed, incomplete_units, class_attendance_rate, community_service_hours, required_service_hours, retention_status, registrar_verified, remarks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '1st Sem AY 2026-2027', $10, 18, 18, 0, 98.5, 30, 30, 'Retention Cleared', true, 'Application approved and authenticated by QCYDO Secretariat.')
             ON CONFLICT (audit_code) DO NOTHING`,
            [`AUDIT-${studentId}`, studentId, user.name, user.email, user.avatar || null, formData.barangay || user.barangay || 'Barangay Central', school, programName, grantAmount, gwa]
          );

          // 3. Save official generated Certificate of Scholarship Award into documents table (Student Vault)
          await pool.query(
            `INSERT INTO documents (user_id, application_id, name, category, upload_date, status, size, file_path, mime_type)
             VALUES ($1, $2, $3, 'award_certificate', CURRENT_DATE, 'verified', '124.5 KB', $4, 'application/pdf')
             ON CONFLICT DO NOTHING`,
            [
              user.id,
              updatedApp.id,
              `Official_Scholar_Award_Certificate_${certNumber}.pdf`,
              `/certificates/${certNumber}.pdf`
            ]
          );

          // 4. Send official Award Certificate email with certificate attachment
          try {
            await emailService.sendScholarshipAwardCertificateEmail({
              to: user.email,
              name: user.name,
              studentId,
              programTitle: programName,
              awardAmount: grantAmount,
              certificateNumber: certNumber,
              school,
              course,
              issueDate,
            });
          } catch (emailErr) {
            console.warn('[applicationModel] Email dispatch note:', emailErr.message);
          }

          // 5. Create in-app notification for the student
          try {
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
               VALUES ($1, $2, $3, 'success', false, 'scholarship_award', '/student/applications')`,
              [
                user.id,
                `🎓 Congratulations! Official Scholar Award Conferred`,
                `Your application for ${programName} has been approved. Your Official Certificate of Scholarship Award (${certNumber}) is ready to download.`
              ]
            );
          } catch (notifErr) {
            console.warn('[applicationModel] Student notification note:', notifErr.message);
          }
        }
      } catch (enrollErr) {
        console.error('[applicationModel] Auto-enrollment & Certificate error on approval:', enrollErr.message);
      }
    }

    return updatedApp || null;
  } catch (err) {
    console.error('[applicationModel] updateStatus error:', err.message);
    throw err;
  }
};

module.exports = { findAll, findByUser, findById, create, updateStatus };
