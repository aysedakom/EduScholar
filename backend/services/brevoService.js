// backend/services/brevoService.js
const { sendViaBrevoApi, logEmailToDatabase } = require('./emailService');
const { pool } = require('../config/db');

const CONFIDENTIALITY_NOTICE = `
--------------------------------------------------------------------------------
CONFIDENTIALITY NOTICE: This email contains student education records
and is intended solely for the designated school official. If you are
not the intended recipient, please notify the sender immediately and
delete this message.
--------------------------------------------------------------------------------
`;

/**
 * Stage 2: Send Student Auto-Acknowledgment Email
 */
async function sendStudentConfirmation({ studentEmail, studentName, referenceNumber, scholarshipTitle }) {
  const subject = `[EduScholar] Application Received - ${referenceNumber}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
      .header { background: #0A1628; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { padding: 20px; }
      .badge { background: #e0f2fe; color: #0369a1; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-family: monospace; }
      .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Quezon City Campus Aid Hub • EduScholar</h2>
        </div>
        <div class="content">
          <p>Dear <strong>${studentName || 'Applicant'}</strong>,</p>
          <p>Your scholarship application for <strong>${scholarshipTitle}</strong> has been successfully received and recorded in the EduScholar platform.</p>
          
          <p><strong>Reference Number:</strong> <span class="badge">${referenceNumber}</span></p>
          <p><strong>Current Status:</strong> <span style="color: #d97706; font-weight: bold;">PENDING_SCHOOL_VERIFICATION</span></p>
          <p><strong>Expected Timeline:</strong> 7 to 10 working days</p>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Your application has been routed to your school registrar / coordinator for enrollment and grade verification.</li>
            <li>Once verified by your institution, the QCYDO Screening Board will render the final evaluation.</li>
            <li>You can track your application status anytime on your <a href="https://eduscholar.up.railway.app/applications">EduScholar Applicant Portal</a>.</li>
          </ul>
        </div>
        <div class="footer">
          © 2026 Local Government Unit of Quezon City • Youth Development Office<br>
          This is an automated operational notification.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    let result = null;
    try {
      result = await sendViaBrevoApi({ to: studentEmail, toName: studentName, subject, htmlContent });
    } catch (err) {
      console.warn('[BrevoService] Primary Brevo API call fallback:', err.message);
    }
    await logEmailToDatabase({
      recipientEmail: studentEmail,
      recipientName: studentName,
      emailType: 'student_confirmation',
      subject,
      codeOrUrl: referenceNumber,
      dispatchMethod: result ? 'brevo_api' : 'simulated',
      status: result ? 'sent' : 'logged',
    });
    return { success: true, messageId: result?.messageId || 'simulated-student-confirmation' };
  } catch (error) {
    console.error('[BrevoService] Error sending student confirmation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Stage 3: Send School Verification Request Email (Includes Expiring Verification URL & Confidentiality Notice)
 */
async function sendSchoolVerificationRequest({ schoolEmail, schoolName, studentName, studentId, course, referenceNumber, token, deadlineHours = 72 }) {
  const verifyUrl = `https://eduscholar.up.railway.app/verify-school/${token}`;
  const subject = `[URGENT] Student Enrollment Verification Required: ${studentName} (${referenceNumber})`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; }
      .container { max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; }
      .header { background: #0A1628; color: #ffffff; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
      .content { padding: 24px; }
      .btn { background: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 20px 0; }
      .confidential { background: #fffbebf8; border: 1px solid #fde68a; padding: 14px; border-radius: 8px; font-size: 11px; color: #92400e; font-family: monospace; white-space: pre-wrap; margin-top: 24px; }
      .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">EduScholar Partner Verification Request</h2>
          <p style="margin:4px 0 0 0; font-size: 12px; color: #93c5fd;">Quezon City Youth Development Office (QCYDO)</p>
        </div>
        <div class="content">
          <p>Dear Designated Official of <strong>${schoolName}</strong>,</p>
          <p>The Quezon City Youth Development Office requires official verification of enrollment and academic standing for the following applicant:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Student Name:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${studentName}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Student ID:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${studentId || 'N/A'}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Degree Program:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${course || 'N/A'}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">Application Ref:</td><td style="padding: 10px; font-family: monospace; font-weight: bold; color: #2563eb;">${referenceNumber}</td></tr>
          </table>

          <p>Please click the button below to review student credentials and render your official coordinator verification decision (Approve / Reject / Request Info):</p>
          
          <div style="text-align: center;">
            <a href="${verifyUrl}" class="btn">Access Secure Verification Portal →</a>
          </div>

          <p style="font-size: 12px; color: #64748b;">Direct Portal URL: <a href="${verifyUrl}">${verifyUrl}</a></p>
          <p style="font-size: 12px; color: #b45309;">⚠️ Note: This secure verification link will expire in ${deadlineHours} hours.</p>

          <div class="confidential">
${CONFIDENTIALITY_NOTICE}
          </div>
        </div>
        <div class="footer">
          © 2026 Local Government Unit of Quezon City • Youth Development Office<br>
          Official Partner Verification System
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    let result = null;
    try {
      result = await sendViaBrevoApi({ to: schoolEmail, toName: schoolName, subject, htmlContent });
    } catch (err) {
      console.warn('[BrevoService] Primary Brevo API call fallback:', err.message);
    }
    await logEmailToDatabase({
      recipientEmail: schoolEmail,
      recipientName: schoolName,
      emailType: 'school_verification_request',
      subject,
      codeOrUrl: verifyUrl,
      dispatchMethod: result ? 'brevo_api' : 'simulated',
      status: result ? 'sent' : 'logged',
    });
    return { success: true, messageId: result?.messageId || 'simulated-school-verification' };
  } catch (error) {
    console.error('[BrevoService] Error sending school verification request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Stage 6: Send Final Verdict Email to Student (AWARDED / WAITLISTED / DENIED)
 */
async function sendStudentDecision({ studentEmail, studentName, referenceNumber, scholarshipTitle, decision, reason }) {
  const isAwarded = String(decision).toUpperCase() === 'AWARD' || String(decision).toUpperCase() === 'AWARDED';
  const isWaitlist = String(decision).toUpperCase() === 'WAITLIST' || String(decision).toUpperCase() === 'WAITLISTED';
  const subject = `[EduScholar] Official Decision Notice: ${scholarshipTitle} (${referenceNumber})`;

  let statusBadge = `<span style="background: #ef4444; color: #fff; padding: 6px 12px; border-radius: 6px; font-weight: bold;">NOT AWARDED</span>`;
  if (isAwarded) {
    statusBadge = `<span style="background: #10b981; color: #fff; padding: 6px 12px; border-radius: 6px; font-weight: bold;">SCHOLARSHIP AWARDED</span>`;
  } else if (isWaitlist) {
    statusBadge = `<span style="background: #f59e0b; color: #fff; padding: 6px 12px; border-radius: 6px; font-weight: bold;">WAITLISTED</span>`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; }
      .container { max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; }
      .header { background: #0A1628; color: #ffffff; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
      .content { padding: 24px; }
      .reason-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px; margin: 16px 0; border-radius: 4px; font-size: 13px; }
      .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">Official Scholarship Verdict</h2>
          <p style="margin:4px 0 0 0; font-size: 12px; color: #93c5fd;">Quezon City Youth Development Office (QCYDO)</p>
        </div>
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>The QCYDO Screening Committee has completed evaluation for your application <strong>${referenceNumber}</strong> under <strong>${scholarshipTitle}</strong>.</p>
          
          <p style="margin: 20px 0;">Final Status: ${statusBadge}</p>

          ${reason ? `<div class="reason-box"><strong>Official Board Rationale:</strong><br>${reason}</div>` : ''}

          ${isAwarded ? `
            <p><strong>Congratulations!</strong> Please sign in to your EduScholar dashboard to view your official Notice of Award and complete Model A disbursement tracking setup.</p>
          ` : `
            <p>We appreciate your interest in the Quezon City Scholarship Program. You may log in to your portal account for detailed evaluation feedback or future application cycles.</p>
          `}
        </div>
        <div class="footer">
          © 2026 Local Government Unit of Quezon City • Youth Development Office
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    let result = null;
    try {
      result = await sendViaBrevoApi({ to: studentEmail, toName: studentName, subject, htmlContent });
    } catch (err) {
      console.warn('[BrevoService] Primary Brevo API call fallback:', err.message);
    }
    await logEmailToDatabase({
      recipientEmail: studentEmail,
      recipientName: studentName,
      emailType: 'student_decision',
      subject,
      codeOrUrl: decision,
      dispatchMethod: result ? 'brevo_api' : 'simulated',
      status: result ? 'sent' : 'logged',
    });
    return { success: true, messageId: result?.messageId || 'simulated-student-decision' };
  } catch (error) {
    console.error('[BrevoService] Error sending student decision email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendStudentConfirmation,
  sendSchoolVerificationRequest,
  sendStudentDecision,
  CONFIDENTIALITY_NOTICE,
};
