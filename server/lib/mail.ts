// importing dependencies
import { createTransport } from "nodemailer";
// defining mail function
async function mail(options: {
  mailTo: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const { mailTo, subject, html, text } = options;
  let transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"Codversity" <reset@codversity.com>',
    to: mailTo,
    subject,
    text,
    html,
  });
}
export default mail;
