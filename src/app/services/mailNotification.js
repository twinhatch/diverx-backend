const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
});
const sendMail = async (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const mailConfigurations = {
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    };
    transporter.sendMail(mailConfigurations, function (error, info) {
      if (error) return reject(error);
      return resolve(info);
    });
  });
};

module.exports = {
  welcomeMail: async (details) => {
    const html = `<div> \r\n<p>Hello,<\/p>\r\n\r\n<p> Welcome to SwiftGuard. <\/p>\r\n\r\n<p>You recently created a SwiftGuard Account. <\/p>\r\n\r\n<p>Your SwiftGuard Registered Mail is: <b>${details.email} <\/b><\/p>\r\n\r\n<p><\/br>Thanks,<\/p>\r\n\r\n<p><b>The SwiftGuard Account Team<\/b><\/p>\r\n<\/div>`;
    await sendMail(details.email, "Welcome to SwiftGuard", html);
  },
  sendOTPmail: async ({ email, code }) => {
    console.log(email, code);
    try {
      const html = `<div> \r\n<p>Hello,<\/p>\r\n\r\n<p> Welcome to <strong>Walk Wise Meal</strong>. <\/p>\r\n\r\n<p>You recently created a Walk Wise Meal Account. <\/p>\r\n\r\n<p>Your Walk Wise Meal Registered Mail is: <b>${email} <\/b><\/p>\r\n\r\n<p><\/br>Thanks,<\/p>\r\n\r\n<p><b>The Walk Wise Meal Account Team<\/b><\/p>\r\n\r\n<p>Your Walk Wise Meal One-Time password  code is: <strong>${code}</strong>. This passcode will expire in 5 minutes<\/p><\/p>\r\n<\/div>`;
      //   const html = `<div> \r\n<p>Password Reset Instructions<\/p>\r\n\r\n<p>Your <strong>Walk Wise Meal</strong> One-Time password  code is: ${code}. Enter online when prompted. This passcode will expire in 5 minutes<\/p><\/br>Thank you for updating your password.<\/p>\r\n\r\n<p><b>SwiftGuard<\/b><\/p>\r\n<\/div>`;
      return await sendMail(email, "Password Reset Instructions", html);
    } catch (err) {
      console.log(err);
      throw new Error("Could not send OTP mail");
    }
  },
  passwordChange: async ({ email }) => {
    try {
      const html = `<div> Your password has been reset, if you didn't update your password, please call us on (.) between 9am - 5pm Monday to Friday. \r\n\r\nSwiftGuard  </div>`;
      return await sendMail(email, "PASSWORD RESET NOTIFICATION EMAIL", html);
    } catch (err) {
      throw new Error("Could not send OTP mail");
    }
  },
  newAccountNotification: async ({ email, username, tempPassword,name }) => {
    try {
      const html = `
        <div>
          <p>Dear ${name},</p>
          <p>Welcome to <strong>DiverX</strong>! Your account has been successfully created.</p>
          <p>Here are your login details:</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>For security reasons, please log in and change your password within the next 1 to 2 days.</p>
          <p>Best regards,</p>
          <p><strong>DiverX Team</strong></p>
        </div>
      `;
      return await sendMail(email, "Welcome to DiverX – Your Account Details", html);
    } catch (err) {
      throw new Error("Could not send new account email");
    }
  }
  
};
