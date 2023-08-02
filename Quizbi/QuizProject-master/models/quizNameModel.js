var mongoose = require("mongoose");
var Schema = mongoose.Schema;

quizNameSchema = new Schema({
  quiz_id: String,
  quizName: String,
  department: String,
  levels: String,
});
const QuizName = mongoose.model("quizName", quizNameSchema);

module.exports = QuizName;
