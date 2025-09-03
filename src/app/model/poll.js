"use strict";
const mongoose = require("mongoose");
const poll = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    options: [{ title: { type: String }, pr: { type: Number, default: 0 } }],
    answered: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        ans: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

poll.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Poll", poll);
