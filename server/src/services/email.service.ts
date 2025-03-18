/*
<aicontext>
This file provides functionality for sending emails using nodemailer.
</aicontext>
*/

import nodemailer from 'nodemailer';
import fs from 'fs';

// Helper function to read Docker secrets
const readSecret = (secretName: string): string => {
  const secretPath = `/run/secrets/${secretName}`;
  
  // Try to read from Docker secrets first
  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, 'utf8').trim();
    }
  } catch (error) {
    console.log(`Could not read secret from ${secretPath}: ${error}`);
  }
  
  // Fall back to environment variables
  return process.env[secretName.toUpperCase()] || '';
};

/**
 * Create a nodemailer transporter for sending emails
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: readSecret('smtp_user') || process.env.SMTP_USER,
    pass: readSecret('smtp_pass') || process.env.SMTP_PASS,
  },
});

/**
 * Sends a thank you email to a user who completed a survey
 * @param email - Recipient email address
 * @param name - Recipient name (optional)
 * @param surveyTitle - Title of the completed survey
 * @returns Promise<boolean> - True if email sent successfully
 */
export const sendThankYouEmail = async (
  email: string,
  name: string | null,
  surveyTitle: string
): Promise<boolean> => {
  const userName = name || 'there';
  
  try {
    const info = await transporter.sendMail({
      from: `"Survey App" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `Thank you for completing ${surveyTitle}`,
      text: `Hello ${userName},\n\nThank you for completing our survey "${surveyTitle}". We appreciate your feedback!\n\nBest regards,\nThe Survey Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You!</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for completing our survey "${surveyTitle}". We appreciate your feedback!</p>
          <p>Best regards,<br>The Survey Team</p>
        </div>
      `,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Verifies the SMTP connection is working
 * @returns Promise<boolean> - True if connection is working
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Error verifying email connection:', error);
    return false;
  }
};

/**
 * Send an email notification
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content of the email
 * @returns Promise<boolean> indicating success
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to,
      subject,
      html,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}; 