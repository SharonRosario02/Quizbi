var mongoose = require("mongoose");
var Schema = mongoose.Schema;

linkSchema = new Schema({
  name: String,
  quiz_id: String,
});
const Link = mongoose.model("Link", linkSchema);

module.exports = Link;
