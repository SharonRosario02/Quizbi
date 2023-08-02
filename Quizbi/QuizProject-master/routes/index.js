var express = require("express");
var router = express.Router();
var User = require("../models/user");
const quizNameModel = require("../models/quizNameModel");
const QuestionModel = require("../models/qustionsModel");
const resultModel = require("../models/resultModel");
const QuizName = require("../models/quizNameModel");
const section = require("../models/sectionModel");
const fs = require("fs").promises;
var unirest = require("unirest");
const { feedBackSchema } = require("../helper/validation_schema");
const feedBack = require("../models/feedbackModule");

router.get("/", async (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/home");
  } else {
    const sectionList = await section.find();
    console.log(sectionList);
    //consolse.log("found");
    return res.render("index.ejs", {
      isLogin: false,
      array: sectionList,
    });
  }
});
router.get("/feedback", function (req, res, next) {
  res.render("feedback.ejs");
});

router.post("/signup", function (req, res, next) {
  console.log(req.body);
  var personInfo = req.body;
  if (
    !personInfo.email ||
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf ||
    !personInfo.mobile
  ) {
    res.send();
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ email: personInfo.email }, function (err, data) {
        if (!data) {
          var c;
          User.findOne({}, function (err, data) {
            if (data) {
              console.log("if");
              c = data.unique_id + 1;
            } else {
              c = 1;
            }

            var newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              username: personInfo.username,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf,
              mobile: personInfo.mobile,
              otp: "12356",
            });

            newPerson.save(function (err, Person) {
              if (err) console.log(err);
              else console.log("Success");
            });
          })
            .sort({ _id: -1 })
            .limit(1);
          res.send({ Success: "You are regestered,You can login now." });
        } else {
          res.send({ Success: "Email is already used." });
        }
      });
    } else {
      res.send({ Success: "password is not matched" });
    }
  }
});

router.get("/login", function (req, res, next) {
  if (req.session.userId) {
    res.redirect("/home");
  } else {
    return res.render("login.ejs");
  }
});

router.post("/login", function (req, res, next) {
  console.log(req.body);
  try {
    User.findOne({ email: req.body.email }, function (err, data) {
      if (data) {
        if (data.password == req.body.password) {
          //console.log("Done Login");
          req.session.userId = data.unique_id;
          if (req.session.lastId) {
            const url = "/link/quiz/" + req.session.lastId;
            console.log(url);

            return res.send({
              Success: "Success!",
              url: url,
            });
          } else {
            if (req.session.home) {
              let page = req.session.home;
              res.send({ Success: "Success!", url: page });
            } else {
              res.send({ Success: "Success!", url: "/home" });
            }
          }
        } else {
          res.send({ Success: "Wrong password!" });
        }
      } else {
        res.send({ Success: "This Email Is not regestered!" });
      }
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
});

router.get("/home", async (req, res, next) => {
  console.log("home");

  const data = await User.findOne({ unique_id: req.session.userId });
  // console.log("data");
  // console.log(data);
  const sectionList = await section.find();
  if (!data) {
    res.redirect("/login");
  } else {
    //console.log("found");
    return res.render("index.ejs", {
      isLogin: true,
      array: sectionList,
    });
  }
});
router.get("/profile", async (req, res, next) => {
  try {
    console.log(req.session.userId);
    let quiz = [];

    const result = await resultModel.find({
      userId: req.session.userId,
      section: { $ne: "link " },
    });
    console.log(result);

    console.log(quiz);
    User.findOne({ unique_id: req.session.userId }, function (err, data) {
      if (!data) {
        res.redirect("/login");
      } else {
        return res.render("userprofile.ejs", {
          name: data.username,
          email: data.email,
          array: result,
          quiz: quiz,
        });
      }
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
});

router.post("/result", async (req, res, next) => {
  try {
    console.log("result", req.session.userId);
    const { questionLimit, quiz_id, score, section, percentage, level } =
      req.body;

    const result = new resultModel({
      quiz_id: quiz_id,
      score: score,
      questionLimit: questionLimit,
      userId: req.session.userId,
      section: section,
      percentage: percentage,
      level: level,
    });

    const existing = await resultModel.find({
      userId: req.session.userId,
      quiz_id: quiz_id,
    });

    if (existing.length === 0) {
      result.save(function (err, data) {
        if (err) console.log(err);
        else console.log("added");
      });
    }

    // const result = await resultModel.create()
  } catch (error) {
    next(error);
    console.log(error);
  }
});
router.get("/feedback", async (req, res, next) => {
  return res.render("feedback.ejs");
});
router.post("/feedback", async (req, res, next) => {
  try {
    console.log(req.body);
    const inputs = await feedBackSchema.validateAsync(req.body);
    const feed = new feedBack(inputs);
    feed.save(function (err, feeds) {
      if (err) console.log(err);
      else console.log(feeds);
    });
    console.log(inputs);
    res.send({ Success: "Feedback sent!" });
  } catch (error) {
    next(error);
    console.log(error);
  }
});
router.get("/quiz/:section/:levels", async (req, res, next) => {
  try {
    const { section, levels } = req.params;

    req.session.home = "/quiz/" + section + "/" + levels;

    console.log(levels);

    const user = await User.findOne({ unique_id: req.session.userId });
    // console.log("data");
    // console.log(user);
    if (!user) {
      res.redirect("/login");
    } else {
      const quizName = await quizNameModel.findOne({
        department: section,
        levels: levels,
      });
      // console.log(quizName);

      const data = await QuestionModel.find({ quiz_id: quizName.quiz_id });

      console.log(section);
      let questionLimits = 10;
      if (
        section == "🌟 bca" ||
        section == "bca" ||
        section == "cs" ||
        section == "🌟cs" ||
        section == "gk" ||
        section == "🌟gk"
      ) {
        questionLimits = 20;
      }
      fs.writeFile("public/file.json", JSON.stringify(data))
        .then(() => {
          console.log("JSON saved");
          return res.render("quiz.ejs", {
            title: quizName.quizName,
            questionLimit: questionLimits,
            section: section,
            level: levels,
            filelocation: "/public/file.json",
          });
        })
        .catch((er) => {
          console.log(er);
        });

      // return res.send({ data });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/logout", function (req, res, next) {
  console.log("logout");
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/login");
      }
    });
  }
});

router.get("/forgetpass", function (req, res, next) {
  res.render("forget.ejs");
});

router.post("/forgetpass", function (req, res, next) {
  console.log(req.body);
  let status = "otpSent";
  //console.log(req.body);
  User.findOne({ mobile: req.body.mobile }, function (err, data) {
    // console.log(data.otp, parseInt(req.body.otp));
    if (!data) {
      res.send({ Success: "This Mobile number Is not regestered!" });
    } else {
      if (req.body.password == req.body.passwordConf) {
        if (!req.body.otp) {
          const otp = Math.floor(Math.random() * 8999 + 1000);
          data.otp = otp;
          var fast2sms = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
          fast2sms.headers({
            authorization:
              "cgRG4aICz9OoOqxBTcm3kBax8wFmU2wpMqoGJsGwIkGYaRAYlEnQ60CFFJyb",
          });
          fast2sms.form({
            variables_values: otp,
            route: "otp",
            numbers: req.body.mobile,
          });
          fast2sms.end(function (resp) {
            try {
              const msg = resp.body;
              console.log("msg", msg);
              // res.send({ Success: "Success!" });
            } catch (error) {
              console.log(error);
            }
          });
        }
        if (data.otp === parseInt(req.body.otp)) {
          console.log("verfied");
          status = "Password changed!";
          data.password = req.body.password;
          data.passwordConf = req.body.passwordConf;
        }
        data.save(function (err, Person) {
          if (err) console.log(err);
          else console.log("Success", Person);
          res.send({ Success: status });
        });
      } else {
        res.send({
          Success: "Password does not matched! Both Password should be same.",
        });
      }
    }
  });
});

module.exports = router;
