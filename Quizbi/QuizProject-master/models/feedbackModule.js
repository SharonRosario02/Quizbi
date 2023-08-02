var mongoose = require("mongoose");

var Schema = mongoose.Schema;

feedBackSchema = new Schema(
  {
    name: String,
    email: String,
    comment: String,
  },
  { timestamps: true }
);
const feedBack = mongoose.model("feedback", feedBackSchema);

module.exports = feedBack;
