import { connect } from "mongoose";
import Logger from "../lib/logger";
require("dotenv").config();
connect(process.env.MONGODB_SRV, (err) => {
  err
    ? Logger.error(err)
    : Logger.info("Connected to the MongoDB database successfully.");
});
