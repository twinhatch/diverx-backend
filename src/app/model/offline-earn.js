"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});
const earnSchema = new mongoose.Schema(
  {
    profession: {
      type: String,
    },
    experience: {
      type: Object
    },
    skills: {
      type: Array,
    },
    cv: {
      type: String,
    },
    learning_modules: {
      type: String
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
  }
);
earnSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});




module.exports = mongoose.model("OfflineEarn", earnSchema);
