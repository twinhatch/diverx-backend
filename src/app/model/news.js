"use strict";
const mongoose = require("mongoose");
const news = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      //   required: true,
    },
    description: {
      type: String,
    },
    newsLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

news.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("News", news);
