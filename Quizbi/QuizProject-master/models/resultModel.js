var mongoose = require("mongoose");
var Schema = mongoose.Schema;

resultSchema = new Schema({
  quiz_id: String,
  score: String,
  questionLimit: String,
  userId: Number,
  section: String,
  percentage: Number,
  level: String,
});
const result = mongoose.model("result", resultSchema);

module.exports = result;
