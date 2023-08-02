var mongoose = require("mongoose");
var Schema = mongoose.Schema;

questionSchema = new Schema({
  quiz_id: String,
  department: String,
  q: String,
  answer: Number,
  options: Array,
});
const Questiondb = mongoose.model("question", questionSchema);

module.exports = Questiondb;
