"use strict";
const mongoose = require("mongoose");
const serviceRequest = new mongoose.Schema(
    {
        type: {
            enum: ["core", "premium"],
            type: String,
            required: true
        },
        services: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
            }
        ],
        expirydate: {
            type: Date,
        },
        amount: {
            type: Number,
        },
        pdf: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        active: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

serviceRequest.set("toJSON", {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("UserService", serviceRequest);
