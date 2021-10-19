// importing dependencies
import { createTransport } from "nodemailer";
// defining mail function
async function mail(
  mailTo: string,
  subject: string,
  html?: string,
  text?: string
) {
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
    subject: subject,
    text: text,
    html: html,
  });
}
export default mail;
