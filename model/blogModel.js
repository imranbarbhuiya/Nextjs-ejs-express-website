import createDomPurify from "dompurify";
import { JSDOM } from "jsdom";
import marked from "marked";
import mongoose from "mongoose";
import mongoose_fuzzy_searching from "mongoose-fuzzy-searching";
import slugify from "slugify";

const dompurify = createDomPurify(new JSDOM().window);

const blogSchema = new mongoose.Schema({
  authorName: {
    type: String,
    required: true,
  },
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
  keywords: {
    type: String,
    required: true,
  },
});
dompurify.addHook("afterSanitizeElements", (node) => {
  // if (node.tagName == "H1") {
  //   node.classList = "ok";
  // }
  if (
    node.tagName == "FOOTER" ||
    node.tagName == "FORM" ||
    node.tagName == "NAV"
  ) {
    node.remove();
  }
});

function markAndSanitize(markdown) {
  return dompurify.sanitize(marked(markdown), {
    USE_PROFILES: { html: true },
  });
}

blogSchema.methods.emptyHtml = function () {
  return !markAndSanitize(this.markdown);
};

blogSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  } else if (this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }
  if (this.markdown) {
    this.sanitizedHtml = markAndSanitize(this.markdown) || "no text provided";
  }
  next();
});

blogSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error(`${Object.keys(error.keyValue)[0]} must be unique`));
  } else {
    next(error);
  }
});

blogSchema.plugin(mongoose_fuzzy_searching, {
  fields: ["keywords", "author", "description", "title"],
});
export default mongoose.model("blog", blogSchema);
