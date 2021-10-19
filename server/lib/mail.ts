// importing dependencies
import { createTransport } from "nodemailer";
import Logger from "./logger";
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

  await transporter
    .sendMail({
      from: '"Codversity" <reset@codversity.com>',
      to: mailTo,
      subject: subject,
      text: text,
      html: html,
    })
    .catch((err: any) => {
      Logger.error(err);
    });
}
export default mail;
