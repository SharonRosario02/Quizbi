var mongoose = require("mongoose");
var Schema = mongoose.Schema;

adminSchema = new Schema({
  unique_id: Number,
  email: String,
  username: String,
  password: String,
  passwordConf: String,
  isAdmin: Boolean,
});
const Admin = mongoose.model("quizAdmins", adminSchema);

module.exports = Admin;
