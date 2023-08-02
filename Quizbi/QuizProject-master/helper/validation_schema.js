const Joi = require("joi");

const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
});

const quizNameSchema = Joi.object({
  qname: Joi.string().lowercase().required(),
  department: Joi.string().lowercase().required(),
  levels: Joi.string().lowercase().required(),
});
const linkSchema = Joi.object({
  name: Joi.string().lowercase().required(),
});
const sectionSchema = Joi.object({
  name: Joi.string().lowercase().required(),
});
const questionSchema = Joi.object({
  quiz_id: Joi.string().lowercase().trim().required(),
  q: Joi.string().trim().lowercase().required(),
  department: Joi.string().trim().lowercase().required(),
  answer: Joi.number().required(),
  options: Joi.array().required(),
});
const feedBackSchema = Joi.object({
  name: Joi.string().lowercase().required(),
  email: Joi.string().lowercase().required(),
  comment: Joi.string().lowercase().required(),
});

module.exports = {
  authSchema,
  quizNameSchema,
  questionSchema,
  linkSchema,
  sectionSchema,
  feedBackSchema,
};
