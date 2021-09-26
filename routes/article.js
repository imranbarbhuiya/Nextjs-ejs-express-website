import { Router } from "express";
const route = new Router();

let articles = [
  {
    title: "new title",
    createdAt: new Date(),
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam, doloribus modi a, autem nobis nam praesentium vitae deserunt sint quos corporis atque sed sit velit, recusandae consequatur eligendi? Deserunt, illum!",
  },
  {
    title: "new title",
    createdAt: new Date(),
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam, doloribus modi a, autem nobis nam praesentium vitae deserunt sint quos corporis atque sed sit velit, recusandae consequatur eligendi? Deserunt, illum!",
  },
];
route
  .get("/", function (req, res) {
    res.render("article/index.ejs", { articles: articles });
  })
  .get("/new", function (req, res) {
    res.render("article/new.ejs");
  });

export default route;
