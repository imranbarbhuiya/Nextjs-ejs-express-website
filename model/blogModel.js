import createDomPurify from "dompurify";
import { JSDOM } from "jsdom";
import marked from "marked";
import mongoose from "mongoose";
import slugify from "slugify";

const dompurify = createDomPurify(new JSDOM().window);

const blogSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  markdown: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  sanitizedHtml: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
});
blogSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.markdown) {
    this.sanitizedHtml =
      dompurify.sanitize(marked(this.markdown), {
        USE_PROFILES: { html: true },
      }) || "no text provided";
  }
  next();
});
export default mongoose.model("blog", blogSchema);
