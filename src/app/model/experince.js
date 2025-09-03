"use strict";

const mongoose = require("mongoose");

const experinceSchema = new mongoose.Schema(
    {
        contractor: {
            type: String,
        },
        client: {
            type: String,
        },
        position: {
            type: String,
        },
        barge: {
            type: String,
        },
        task: {
            type: String,
        },
        startJobSupportingDoc: {
            type: String,
        },
        endJobSupportingDoc: {
            type: String,
        },
        workigstartdate:{
            type:Date
          },
        workigenddate:{
            type:Date
          },
          diver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          }
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model("Experince", experinceSchema);
