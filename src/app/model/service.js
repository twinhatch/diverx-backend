"use strict";
const mongoose = require("mongoose");
const service = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    whatsapp_msg: {
      type: String,
    },
    content: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
    },
    sample: [{ type: String }],
    type: {
      enum: ["core", "premium"],
      type: String,
      required: true
    },
    subservice: [
      {
        subtitle: {
          type: String,
          // required: true,
        },
        subcontent: {
          type: String,
        },
        price: {
          type: Number,
        },
        whatsapp_msg: {
          type: String,
        },
      }

    ]
  },
  {
    timestamps: true,
  }
);

service.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Service", service);
