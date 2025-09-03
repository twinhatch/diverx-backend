const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const whatsappSchema = new Schema(
  {
    number: {
      type: "string",
    },
    phoneID: {
      type: "string",
    },
    token: {
      type: "string",
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wapp", whatsappSchema);
