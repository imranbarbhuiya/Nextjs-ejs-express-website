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
    { expiresIn: "24h" }
  );
  const mailTo = req.user.email;
  await User.findOneAndUpdate(
    { email: mailTo },
    {
      verificationToken: verificationToken,
    }
  );
  const returnTo = req.session.returnTo;
  delete req.session.returnTo;
  mail(
    mailTo,
    "Verify account",
    `<p>Verify account</p>
        <a href="${req.protocol}://${req.headers.host}/verify/${encoded}">Click here</a>`
  )
    .then(req.flash("success", "Check email to verify"))
    .catch((error) => {
      req.flash("error", "mail send failed please try again");
      console.log(error);
    });
  res.redirect(returnTo || "/");
}

export { verify };
