import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import mail from "../module/mail.js";
async function verify(req, res) {
  let verificationToken = randomBytes(20).toString("hex");
  const encoded = jwt.sign(
    {
      id: req.user.id,
      token: verificationToken,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const mailTo = req.user.email;
  await User.findOneAndUpdate(
    { email: mailTo },
    {
      verificationToken: verificationToken,
    }
  );
  //   res.locals.message = req.flash("success", "Check email to proceed");
  console.log("email send");
  res.redirect("/");
  mail(
    mailTo,
    "Verify account",
    `<p>Verify account</p>
        <a href="${req.protocol}://${req.headers.host}/verify/${encoded}">Click here</a>`
  ).catch((error) => {
    req.flash("error", "auth fail");
    console.log(error);
  });
}

export { verify };
