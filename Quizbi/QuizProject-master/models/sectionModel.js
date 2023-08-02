var mongoose = require("mongoose");
var Schema = mongoose.Schema;

sectionSchema = new Schema({
  name: String,
  section_id: String,
});
const section = mongoose.model("sections", sectionSchema);

module.exports = section;
