// importing dependencies
import { createTransport } from "nodemailer";
// importing dompurify
import DOMpurify from "../lib/dompurify";
// defining mail function
async function mail(
  mailTo: string,
  subject: string,
  html?: string,
  text?: string
) {
  html = DOMpurify.sanitize(html);
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
