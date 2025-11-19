const nodemailer = require('nodemailer');

// Initialize email transporter
const createTransporter = () => {
  // Support multiple email providers
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  blogPublished: (authorName, blogTitle, blogUrl) => ({
    subject: `New Blog Published: ${blogTitle}`,
    html: `
      <p><strong>${authorName}</strong> has published a new academic blog post titled: <strong>${blogTitle}</strong></p>
      <p>
        <a href="${blogUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          Read the Blog
        </a>
      </p>
      <p>Stay updated with the latest academic discussions and content from our community.</p>
    `,
  }),

  commentAdded: (commentAuthorName, blogTitle, blogUrl, blogAuthorName) => ({
    subject: `New Comment on ${blogAuthorName}'s Blog: ${blogTitle}`,
    html: `
      <p><strong>${commentAuthorName}</strong> has commented on <strong>${blogAuthorName}'s</strong> blog post titled: <strong>${blogTitle}</strong> </p>
      <p>
        <a href="${blogUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          View Comments
        </a>
      </p>
      <p>Check out what the community is saying about work!</p>
    `,
  }),

  studentCreated: (studentName, email, password, loginUrl) => ({
    subject: 'Welcome to Academic Blog Platform - Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Academic Blog Platform, ${studentName}! 👋</h2>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Your account has been created by an administrator. Below are your login credentials.
        </p>

        <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #374151; margin: 8px 0;"><strong>Email:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 3px;">${email}</code></p>
          <p style="color: #374151; margin: 8px 0;"><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 3px;">${password}</code></p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Login to Your Account
          </a>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">
          If you didn't expect to receive this email or have any questions, please contact your administrator.<br><br>
          <strong>Platform:</strong> Academic Blog Platform<br>
          <strong>Created:</strong> ${new Date().toLocaleDateString()}
        </p>
      </div>
    `,
  }),
};

// Send email to single recipient
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    // Verify connection only on first use in development
    if (process.env.NODE_ENV === 'development') {
      try {
        await transporter.verify();
        console.log('✅ Email service ready');
      } catch (error) {
        console.error('⚠️ Email service verification failed:', error.message);
        // Continue anyway - might work despite verification failure
      }
    }

    // For Gmail, use the Gmail email as from (Gmail requires this)
    // But display the EMAIL_FROM in the reply-to field
    const fromEmail = process.env.EMAIL_SERVICE === 'gmail' 
      ? process.env.GMAIL_EMAIL 
      : (process.env.EMAIL_FROM || process.env.SMTP_USER);

    const mailOptions = {
      from: `"${'Academic Blog' || process.env.EMAIL_FROM}" <${fromEmail}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}:`, result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send email to multiple recipients in parallel (not sequential)
const sendEmailBatch = async (recipients, subject, html) => {
  try {
    const transporter = createTransporter();

    // For Gmail, use the Gmail email as from (Gmail requires this)
    // But display the EMAIL_FROM in the from field
    const fromEmail = process.env.EMAIL_SERVICE === 'gmail' 
      ? process.env.GMAIL_EMAIL 
      : (process.env.EMAIL_FROM || process.env.SMTP_USER);

    // Send all emails in parallel using Promise.allSettled for resilience
    const emailPromises = recipients.map((recipient) =>
      (async () => {
        try {
          const mailOptions = {
            from: `"${'Academic Blog' || process.env.EMAIL_FROM}" <${fromEmail}>`,
            to: recipient,
            subject,
            html,
          };

          const result = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${recipient}:`, result.messageId);
          return { recipient, success: true, messageId: result.messageId };
        } catch (error) {
          console.error(`❌ Failed to send email to ${recipient}:`, error.message);
          return { recipient, success: false, error: error.message };
        }
      })()
    );

    const results = await Promise.allSettled(emailPromises);
    
    // Extract values from settled promises
    const settledResults = results.map((result) =>
      result.status === 'fulfilled' ? result.value : { success: false, error: 'Promise rejected' }
    );

    return settledResults;
  } catch (error) {
    console.error('❌ Batch email send failed:', error.message);
    return [];
  }
};

// Notify all users about new published blog
const notifyBlogPublished = async (blog, authorName) => {
  try {
    const User = require('../models/User');

    // Get all users except the author
    const allUsers = await User.find(
      { _id: { $ne: blog.author } },
      'email'
    ).lean();

    if (allUsers.length === 0) {
      console.log('ℹ️ No other users to notify');
      return { success: true, notified: 0 };
    }

    const recipientEmails = allUsers.map((user) => user.email);
    const blogUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog/${blog._id}`;

    const { subject, html } = emailTemplates.blogPublished(
      authorName,
      blog.title,
      blogUrl
    );

    const results = await sendEmailBatch(recipientEmails, subject, html);
    const successCount = results.filter((r) => r.success).length;

    console.log(
      `📧 Blog published notification: ${successCount}/${recipientEmails.length} emails sent`
    );

    return { success: true, notified: successCount, total: recipientEmails.length };
  } catch (error) {
    console.error('❌ Failed to notify blog publication:', error.message);
    return { success: false, error: error.message };
  }
};

// Notify all users about new comment (especially blog author and other commenters)
const notifyCommentAdded = async (comment, blog, commentAuthorName) => {
  try {
    const User = require('../models/User');

    // Get all users except the comment author
    const allUsers = await User.find(
      { _id: { $ne: comment.author } },
      'email'
    ).lean();

    if (allUsers.length === 0) {
      console.log('ℹ️ No other users to notify');
      return { success: true, notified: 0 };
    }

    const recipientEmails = allUsers.map((user) => user.email);
    const blogUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog/${blog._id}`;

    const { subject, html } = emailTemplates.commentAdded(
      commentAuthorName,
      blog.title,
      blogUrl,
      blog.author.name
    );

    const results = await sendEmailBatch(recipientEmails, subject, html);
    const successCount = results.filter((r) => r.success).length;

    console.log(
      `📧 Comment notification: ${successCount}/${recipientEmails.length} emails sent`
    );

    return { success: true, notified: successCount, total: recipientEmails.length };
  } catch (error) {
    console.error('❌ Failed to notify comment addition:', error.message);
    return { success: false, error: error.message };
  }
};

// Notify student about account creation with credentials
const notifyStudentCreated = async (studentName, studentEmail, password) => {
  try {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    const { subject, html } = emailTemplates.studentCreated(
      studentName,
      studentEmail,
      password,
      loginUrl
    );

    const result = await sendEmail(studentEmail, subject, html);

    if (result.success) {
      console.log(`📧 Student creation email sent to ${studentEmail}`);
    } else {
      console.error(`❌ Failed to send student creation email to ${studentEmail}:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to notify student creation:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendEmailBatch,
  notifyBlogPublished,
  notifyCommentAdded,
  notifyStudentCreated,
};
