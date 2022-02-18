// import dependencies
import fuzzySearching, {
  MongoosePluginModel,
} from "@imranbarbhuiya/mongoose-fuzzy-searching";
import type { NextFunction } from "express";
import { marked } from "marked";
import type { Document, Error as MongoError } from "mongoose";
import { model, Schema } from "mongoose";
import slugify from "slugify";
// import dom
import DOMpurify from "../lib/dompurify";

interface Blog extends Document {
  emptyHtml(): boolean;
  authorName: string;
  author: string;
  title: string;
  description: string;
  markdown: string;
  createdAt: Date;
  slug?: string;
  sanitizedHtml?: string;
  keywords: string;
  verified: boolean;
}

const blogSchema = new Schema<Blog>({
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
  createdAt: { type: Date, default: new Date() },
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
DOMpurify.addHook("afterSanitizeElements", (node) => {
  // if (node.tagName === "H1") {
  //   node.classList = "ok";
  // }
  if (
    node.tagName === "FOOTER" ||
    node.tagName === "FORM" ||
    node.tagName === "NAV"
  ) {
    node.remove();
  }
});

function markAndSanitize(markdown: string) {
  return DOMpurify.sanitize(marked.parse(markdown), {
    USE_PROFILES: { html: true },
  });
}

blogSchema.methods.emptyHtml = function () {
  return !markAndSanitize(this.markdown);
};

blogSchema.pre<Blog>("validate", function (next) {
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

blogSchema.post("save", (error: _Error, _doc: Blog, next: NextFunction) => {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error(`${Object.keys(error.keyValue)[0]} must be unique`));
  } else {
    next(error);
  }
});

blogSchema.plugin(fuzzySearching, {
  fields: ["keywords", "author", "description", "title"],
});
const blogModel = model<Blog>("blog", blogSchema) as MongoosePluginModel<Blog>;
export default blogModel;
export type { Blog };

interface _Error extends MongoError {
  code?: number;
  keyValue?: string;
}
