const nodemailer = require('nodemailer');

/**
 * Checks if the user exists in the database.
 * (Mock database lookup skeleton for standard Node/Express configuration).
 */
async function checkUserExists(email) {
  // Skeleton database search: in production, replace with:
  // return await User.findOne({ email });
  console.log(`[Node.js Mock DB] Checking if email exists: ${email}`);
  return true; 
}

/**
 * Endpoint controller for forgot password request.
 * POST /api/auth/forgot-password
 */
async function forgotPasswordHandler(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    console.log(`[Node.js Controller] Received forgot-password request for email: ${email}`);

    // 1. Check if user exists in the database
    const userExists = await checkUserExists(email);
    if (!userExists) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    // 2. Set up standard Node.js email transporter (using nodemailer)
    // In production, configure with actual SMTP settings from env variables.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'mockuser@ethereal.email',
        pass: process.env.SMTP_PASS || 'mockpassword',
      },
    });

    const mailOptions = {
      from: '"OrbitX Support" <support@orbitx.com>',
      to: email,
      subject: 'OrbitX - Password Reset Notification',
      text: 'You requested a password reset. Please use the following link to reset your password: http://orbitx.com/reset-password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #00e5ff;">OrbitX Password Reset</h2>
          <p>We received a request to reset the password associated with your OrbitX account.</p>
          <p>Please click the link below to complete the reset process:</p>
          <p><a href="http://orbitx.com/reset-password" style="background-color: #00e5ff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>If you did not make this request, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #777;">The OrbitX Cosmic Team</p>
        </div>
      `,
    };

    // 3. Trigger email send
    console.log(`[Node.js Transporter] Sending reset email to ${email}...`);
    // Note: Ethereal SMTP is mock, but this is the standard Node transporter pattern.
    await transporter.sendMail(mailOptions);
    console.log(`[Node.js Transporter] Email successfully dispatched.`);

    return res.status(200).json({
      message: 'A password reset notification has been sent to your registered email address.',
    });
  } catch (error) {
    console.error('[Node.js Forgot Password Error]:', error);
    return res.status(500).json({
      error: 'An internal error occurred while processing the request.',
    });
  }
}

module.exports = {
  forgotPasswordHandler,
  checkUserExists,
};
