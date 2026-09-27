// services/emailService.js
// Production-ready transactional email service supporting Resend and Nodemailer SMTP (Gmail, SendGrid, etc.)
// Gracefully falls back to development simulation if credentials are not configured.

const nodemailer = require("nodemailer");

/**
 * Creates a configured Nodemailer transport if SMTP credentials exist.
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port: port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
};

/**
 * Sends a welcome email to newly created students.
 * @param {Object} studentData - { name, email, registrationNumber }
 * @returns {Promise<{ success: boolean, simulated: boolean, message?: string, error?: string }>}
 */
const sendWelcomeEmail = async ({ name, email, registrationNumber }) => {
  const regNoDisplay = registrationNumber || "Not Assigned";
  const studentName = name || "Student";
  const subject = "Welcome to SRM Mess";

  const textBody = `Welcome to SRM Mess!

Hello ${studentName},

Welcome to SRM Mess Management System.

Your student account has been successfully created.

Registration Number: ${regNoDisplay}
Email: ${email}

You can now log in to the SmartMess AI student portal.

Thank you,
SRM Mess Team
SmartMess AI`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Welcome to SRM Mess!</h1>
        <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px;">SmartMess AI Management System</p>
      </div>
      <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
        <p style="font-size: 16px; margin: 0 0 16px 0;">Hello <strong>${studentName}</strong>,</p>
        <p style="margin: 0 0 20px 0;">Welcome to <strong>SRM Mess Management System</strong>. Your student account has been successfully created.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Registration Number:</strong> <span style="font-family: monospace; color: #0d9488;">${regNoDisplay}</span></p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
        </div>

        <p style="margin: 20px 0;">You can now log in to the SmartMess AI student portal using your registered credentials.</p>
        
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
          <p style="margin: 0;">Thank you,<br /><strong>SRM Mess Team</strong><br />SmartMess AI</p>
        </div>
      </div>
    </div>
  `;

  // 1. Try Resend API if RESEND_API_KEY is provided
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: subject,
          text: textBody,
          html: htmlBody,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Email Service] Welcome email delivered via Resend to ${email} (ID: ${data.id})`);
        return { success: true, simulated: false, id: data.id };
      } else {
        console.error(`[Email Service] Resend error:`, data);
        return { success: false, simulated: false, error: data.message || "Resend delivery failed" };
      }
    } catch (err) {
      console.error(`[Email Service] Resend dispatch exception:`, err.message);
      return { success: false, simulated: false, error: err.message };
    }
  }

  // 2. Try Nodemailer SMTP if configured
  const transporter = createTransporter();
  if (transporter) {
    try {
      const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
      const info = await transporter.sendMail({
        from: `"SRM Mess Team" <${fromAddr}>`,
        to: email,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[Email Service] Welcome email sent via SMTP to ${email} (MessageId: ${info.messageId})`);
      return { success: true, simulated: false, id: info.messageId };
    } catch (err) {
      console.error(`[Email Service] SMTP error sending to ${email}:`, err.message);
      return { success: false, simulated: false, error: err.message };
    }
  }

  // 3. Fallback to Nodemailer's Ethereal Email (Real temporary inbox)
  try {
    console.log(`\n📧 [EMAIL SERVICE] Generating a temporary test account for delivery...`);
    const testAccount = await nodemailer.createTestAccount();
    
    const testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await testTransporter.sendMail({
      from: '"SRM Mess Team" <admin@smartmess.ai>',
      to: email,
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n========================================================`);
    console.log(`✅ Welcome Email successfully sent to a temporary inbox!`);
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reg No:  ${regNoDisplay}`);
    console.log(`\n🔗 CLICK HERE TO VIEW THE REAL EMAIL:`);
    console.log(`-> ${previewUrl}`);
    console.log(`========================================================\n`);

    return {
      success: true,
      simulated: true,
      message: "Email sent to temporary inbox. Check backend terminal for the link to view it!",
    };
  } catch (err) {
    console.error(`[Email Service] Ethereal test email error:`, err.message);
    return {
      success: false,
      simulated: true,
      error: "Failed to generate test email",
    };
  }
};

/**
 * Sends attendance confirmation email with today's menu to student upon marking attendance.
 * @param {Object} params - { name, email, mealType, menu }
 */
const sendAttendanceConfirmationEmail = async ({ name, email, mealType = "meal", menu = null }) => {
  const studentName = name || "Student";
  const capitalMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const subject = `Attendance Marked (${capitalMeal}) - Today's Mess Menu`;

  // Format menu text & html
  let menuHtml = "";
  let menuText = "";

  if (menu && menu.meals) {
    const bItems = (menu.meals.breakfast?.items || []).join(", ") || "Standard Breakfast";
    const lItems = (menu.meals.lunch?.items || []).join(", ") || "Standard Lunch";
    const dItems = (menu.meals.dinner?.items || []).join(", ") || "Standard Dinner";

    menuText = `Today's Menu (${dateStr}):\n- Breakfast: ${bItems}\n- Lunch: ${lItems}\n- Dinner: ${dItems}`;
    menuHtml = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #0d9488; font-size: 15px; text-transform: uppercase; tracking: 0.5px;">Today's Menu (${dateStr})</h3>
        <p style="margin: 6px 0; font-size: 14px;"><strong>🌅 Breakfast:</strong> ${bItems}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>☀️ Lunch:</strong> ${lItems}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>🌙 Dinner:</strong> ${dItems}</p>
      </div>
    `;
  } else {
    menuText = `Today's Menu (${dateStr}):\nFreshly prepared nutritious meals are served at your mess today!`;
    menuHtml = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; color: #0d9488; font-size: 15px;">Today's Menu (${dateStr})</h3>
        <p style="margin: 0; font-size: 14px; color: #475569;">Freshly prepared, delicious and nutritious meals are served at your mess counter today. Enjoy your meal!</p>
      </div>
    `;
  }

  const textBody = `Thanks for marking today's attendance!

Hello ${studentName},

Your attendance for ${capitalMeal} has been successfully recorded on ${dateStr}.

${menuText}

Enjoy your meal!

Thank you,
SRM Mess Team
SmartMess AI`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
        <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; color: #ffffff; font-weight: 600; font-size: 13px; margin-bottom: 8px;">
          ✓ Attendance Confirmed
        </div>
        <h1 style="color: #ffffff; margin: 8px 0 0 0; font-size: 24px; font-weight: 700;">Thanks for marking today's attendance!</h1>
        <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px;">${capitalMeal} · ${dateStr}</p>
      </div>
      <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
        <p style="font-size: 16px; margin: 0 0 16px 0;">Hello <strong>${studentName}</strong>,</p>
        <p style="margin: 0 0 16px 0;">Your attendance for <strong>${capitalMeal}</strong> has been successfully marked. Below are today's meal details:</p>
        
        ${menuHtml}

        <p style="margin: 20px 0 0 0; font-weight: 500; color: #059669;">Bon Appétit! Have a wonderful meal. 🍽️</p>
        
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
          <p style="margin: 0;">Warm regards,<br /><strong>SRM Mess Operations</strong><br />SmartMess AI System</p>
        </div>
      </div>
    </div>
  `;

  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: subject,
          text: textBody,
          html: htmlBody,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Email Service] Attendance confirmation email sent via Resend to ${email} (ID: ${data.id})`);
        return { success: true, simulated: false, id: data.id };
      }
    } catch (err) {
      console.error(`[Email Service] Resend error for attendance email:`, err.message);
    }
  }

  // 2. Try Nodemailer SMTP if configured
  const transporter = createTransporter();
  if (transporter) {
    try {
      const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
      const info = await transporter.sendMail({
        from: `"SRM Mess Team" <${fromAddr}>`,
        to: email,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[Email Service] Attendance email sent via SMTP to ${email} (MessageId: ${info.messageId})`);
      return { success: true, simulated: false, id: info.messageId };
    } catch (err) {
      console.error(`[Email Service] SMTP error sending attendance email to ${email}:`, err.message);
    }
  }

  // 3. Fallback to Nodemailer Ethereal Email
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await testTransporter.sendMail({
      from: '"SRM Mess Team" <admin@smartmess.ai>',
      to: email,
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n========================================================`);
    console.log(`✅ Attendance Email sent to temporary inbox!`);
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`\n🔗 CLICK HERE TO VIEW THE REAL ATTENDANCE & MENU EMAIL:`);
    console.log(`-> ${previewUrl}`);
    console.log(`========================================================\n`);

    return {
      success: true,
      simulated: true,
      message: "Attendance email sent to test inbox.",
    };
  } catch (err) {
    console.error(`[Email Service] Attendance test email error:`, err.message);
    return { success: false, simulated: true, error: err.message };
  }
};

/**
 * Sends attendance alert email to staff when a student's attendance is recorded.
 * @param {Object} params - { staffEmail, staffName, studentName, studentEmail, mealType, method, verifiedBy }
 */
const sendStaffAttendanceAlertEmail = async ({
  staffEmail,
  staffName = "Mess Staff",
  studentName = "Student",
  studentEmail = "",
  mealType = "meal",
  method = "QR Verification",
  verifiedBy = "Staff",
}) => {
  const capitalMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const nowStr = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const subject = `[Staff Alert] Attendance Marked for ${studentName} (${capitalMeal})`;

  const textBody = `[Staff Attendance Notification]
Student: ${studentName} (${studentEmail})
Meal: ${capitalMeal}
Method: ${method}
Recorded at: ${nowStr}
Verified By: ${verifiedBy}

SmartMess AI Management System`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%); padding: 28px 24px; text-align: center;">
        <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; color: #ffffff; font-weight: 600; font-size: 12px; margin-bottom: 8px;">
          🔔 Staff Operations Alert
        </div>
        <h2 style="color: #ffffff; margin: 6px 0 0 0; font-size: 20px; font-weight: 700;">Student Attendance Recorded</h2>
        <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px;">${capitalMeal} Service · ${nowStr}</p>
      </div>
      <div style="padding: 28px 24px; color: #334155; line-height: 1.6;">
        <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${staffName}</strong>,</p>
        <p style="margin: 0 0 16px 0;">Attendance has been recorded in the SmartMess AI database with the following details:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Student Name:</strong> ${studentName}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Student Email:</strong> ${studentEmail}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Meal Type:</strong> <span style="color: #0d9488; font-weight: 600;">${capitalMeal}</span></p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Method:</strong> ${method}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Timestamp:</strong> ${nowStr}</p>
        </div>

        <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b;">
          Headcount and kitchen food waste analytics have been updated automatically.
        </p>

        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          SmartMess AI Staff Dashboard · Automated Operations Alert
        </div>
      </div>
    </div>
  `;

  if (!staffEmail) {
    staffEmail = process.env.EMAIL_USER || "staff@smartmess.ai";
  }

  // 1. Try Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [staffEmail],
          subject: subject,
          text: textBody,
          html: htmlBody,
        }),
      });
      if (response.ok) {
        console.log(`[Email Service] Staff alert sent to ${staffEmail} via Resend`);
        return { success: true };
      }
    } catch (e) {
      console.error("[Email Service] Resend error for staff alert:", e.message);
    }
  }

  // 2. Try SMTP
  const transporter = createTransporter();
  if (transporter) {
    try {
      const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
      await transporter.sendMail({
        from: `"SmartMess AI Ops" <${fromAddr}>`,
        to: staffEmail,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`[Email Service] Staff alert sent to ${staffEmail} via SMTP`);
      return { success: true };
    } catch (e) {
      console.error("[Email Service] SMTP error for staff alert:", e.message);
    }
  }

  // 3. Fallback
  console.log(`[Email Service] Staff alert logged for ${staffEmail}: ${studentName} - ${capitalMeal}`);
  return { success: true, simulated: true };
};

module.exports = {
  sendWelcomeEmail,
  sendAttendanceConfirmationEmail,
  sendStaffAttendanceAlertEmail,
};


