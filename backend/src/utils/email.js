// ===========================================
// src/utils/email.js - Email Utility
// ===========================================

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { prisma } = require('../config/database');
const logger = require('./logger');

async function sendEmail({ to, subject, template, data, organizationId }) {
  try {
    // Get email configuration
    let emailConfig;
    
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { emailConfig: true }
      });
      emailConfig = org?.emailConfig;
    }

    // Use default config if organization config not available
    const config = emailConfig || {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT || 587,
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER,
      smtpPassword: process.env.SMTP_PASSWORD,
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME || 'SportBook'
    };

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      }
    });

    // Render email template
    let html;
    if (template) {
      const templatePath = path.join(__dirname, '../templates/emails', `${template}.ejs`);
      html = await ejs.renderFile(templatePath, data);
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html: html || data.message
    });

    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return true;

  } catch (error) {
    logger.error('Send email error:', error);
    throw error;
  }
}

module.exports = { sendEmail };