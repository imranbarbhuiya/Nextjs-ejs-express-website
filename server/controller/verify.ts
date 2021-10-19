// importing dependencies
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import Logger from "../lib/logger";
// mail module
import mail from "../lib/mail";
// mongoose model
import User from "../model/userModel";
// verify controller
async function verify(req, res) {
  const verificationToken = randomBytes(20).toString("hex");
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
      verificationToken,
    }
  );
  const returnTo = req.session.returnTo;
  delete req.session["returnTo"];
  mail(
    mailTo,
    "Verify account",
    `<p>Verify account</p>
        <a href="${req.protocol}://${req.headers.host}/verify/${encoded}">Click here</a>`
  )
    .then(req.flash("info", "Check email to verify"))
    .catch((error) => {
      req.flash("error", "Mail send failed please try again");
      Logger.error(error);
    });
  res.redirect(req.query.next || returnTo || "/");
}

export { verify };
