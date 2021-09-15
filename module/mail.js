import { createTransport } from "nodemailer";

async function mail(mailTo, subject, html, text) {
  let transporter = createTransport({
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
}
export default mail;
