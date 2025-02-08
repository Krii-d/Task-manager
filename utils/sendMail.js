const nodemailer = require("nodemailer");

// Create transporter with Gmail service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Define email options
const sendEmail = ({ to, subject, text }) => {
  console.log(to, subject, text, "sendEmail");
  console.log(process.env.EMAIL_PASSWORD);
  // Send email
  console.log(process.env.EMAIL);
  transporter.sendMail(
    {
      from: "sandip.axios@gmail.com",
      to: to,
      subject: subject,
      text: text,
    },
    (error, info) => {
      if (error) {
        console.error("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    }
  );
};

module.exports = {
  sendEmail,
};
