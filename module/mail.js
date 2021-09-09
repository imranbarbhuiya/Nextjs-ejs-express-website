const nodemailer = require("nodemailer");

async function mail(mailTo, subject, html, text) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"Codversity" <reset@codversity.com>',
    to: mailTo,
    subject: subject,
    text: text,
    html: html,
  });

  console.log("Message sent: %s", info.messageId);
}
module.exports = mail;