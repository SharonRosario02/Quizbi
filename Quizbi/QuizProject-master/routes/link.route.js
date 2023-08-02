var express = require("express");
var router = express.Router();
const { linkSchema, questionSchema } = require("../helper/validation_schema");
const Link = require("../models/linkModel");
var User = require("../models/user");
const Questiondb = require("../models/qustionsModel");
var uuid = require("uuid");
const fs = require("fs");

router.get("/", async (req, res, next) => {
  try {
    if (!req.session.adminId) {
      return res.redirect("/admin/login");
    }
    const { id, isAdmin } = req.session.adminId;

    if (!isAdmin) {
      res.redirect("/");
    }
    const listQiz = await Link.find({});
    console.log(listQiz);
    res.render("createLink", {
      quizs: listQiz,
      url: "createLink",
      isUpdate: false,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/createLink", async (req, res, next) => {
  try {
    const result = await linkSchema.validateAsync(req.body);
    let id = uuid.v4();
    console.log(result);
    Link.findOne({ name: result.name }, function (err, data) {
      if (!data) {
        console.log(data);
        const newQuiz = new Link({
          name: result.name,
          quiz_id: id.trim(),
        });
        newQuiz.save(function (err, quiz) {
          if (err) {
            console.log(err);
          } else {
            console.log("Success", id);
            id = "/link/addQuestion/" + id;
            res.send({ Success: "Success!", quiz_id: id });
          }
        });
      } else {
        res.send({ Success: "Already created!" });
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/editLink/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!req.session.adminId) {
      return res.redirect("/admin/login");
    }
    const { isAdmin } = req.session.adminId;

    if (!isAdmin) {
      res.redirect("/");
    }
    const listQiz = await Link.find();
    console.log(listQiz);
    const url = "editLink/" + id;
    res.render("createLink", { quizs: listQiz, url: url, isUpdate: true });
  } catch (error) {
    next(error);
  }
});
router.post("/editLink/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    const result = await linkSchema.validateAsync(req.body);
    // console.log(result);

    const data = await Link.findOne({ name: result.name });
    console.log(data);
    if (!data) {
      const newQuiz = await Link.findByIdAndUpdate(
        id,
        { name: result.name },
        { new: true }
      );
      console.log("Success", newQuiz);
      id = "/link/";
      res.send({ Success: "Success!", quiz_id: id });
    } else {
      res.send({ Success: "Already created!" });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/deleteQuizName/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("deleteBy", id);
    if (id != null || id != undefined) {
      const result = await Link.findByIdAndDelete(id);
      if (!result) {
        res.send({ Success: "Something wrong!" });
      } else {
        const data = await Questiondb.deleteMany({ quiz_id: result.quiz_id });
        console.log(data);
        const url = "/link/";
        res.redirect(url);
      }
    }
  } catch (error) {
    next(error);
  }
});

router.get("/addQuestion/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("add", id);
    if (id != null || id != undefined) {
      Link.findOne({ quiz_id: id.trim() }, function (err, data) {
        Questiondb.find({ quiz_id: id.trim() }, function (err, result) {
          if (!data) {
            res.redirect("/");
          } else {
            console.log(result);
            return res.render("addQuestion.ejs", {
              id: data.quiz_id,
              qname: data.name,
              depart: "link",
              questions: result,
              url: "/link/",
            });
          }
        });
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/addQuestion", async function (req, res, next) {
  console.log(req.body);
  try {
    const result = await questionSchema.validateAsync(req.body);
    console.log(result);

    Questiondb.findOne({ question: result.q }, function (err, data) {
      if (!data) {
        console.log(data);
        const newQuiz = new Questiondb({
          quiz_id: result.quiz_id,
          department: result.department,
          q: result.q,
          answer: result.answer,
          options: result.options,
        });
        newQuiz.save(function (err, quiz) {
          if (err) console.log(err);
          else console.log("Success");
        });
        res.send({ Success: "Success!", quiz_id: result.quiz_id });
      } else {
        res.send({ Success: "Already created!" });
      }
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
});

router.get("/edit/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    if (id != null || id != undefined) {
      const result = await Questiondb.findById(id);
      if (!result) {
        res.send({ Success: "Something wrong!" });
      } else {
        console.log(result.options);
        res.render("editQuetion", {
          id: result._id,
          quiz_id: result.quiz_id,
          department: result.department,
          q: result.q,
          answer: result.answer,
          options: result.options,
          url: "/link/",
        });
      }
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

router.post("/editQuestion", async function (req, res, next) {
  try {
    let update = req.body;
    const id = update.id;

    const data = {
      quiz_id: update.quiz_id,
      department: update.department,
      q: update.q,
      answer: update.answer,
      options: update.options,
    };
    const inputs = await questionSchema.validateAsync(data);
    console.log("inputs", inputs);

    const result = await Questiondb.findByIdAndUpdate(id.trim(), inputs);
    console.log("result", result);
    const url = "/link/addQuestion/" + result.quiz_id;
    res.send({ Success: "Success!", quiz_id: url });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
router.get("/delete/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id != null || id != undefined) {
      const result = await Questiondb.findByIdAndDelete(id);
      if (!result) {
        res.send({ Success: "Something wrong!" });
      } else {
        const url = "/link/addQuestion/" + result.quiz_id;
        res.redirect(url);
      }
    }
  } catch (error) {
    next(error);
  }
});

router.get("/quiz/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    req.session.lastId = id;

    const user = await User.findOne({ unique_id: req.session.userId });
    // console.log("data");
    // console.log(user);
    if (!user) {
      res.redirect("/login");
    } else {
      const quizName = await Link.findOne({ quiz_id: id });
      console.log(quizName);
      const data = await Questiondb.find({ quiz_id: quizName.quiz_id });
      console.log(data);

      fs.writeFileSync("public/link.json", JSON.stringify(data));

      return res.render("quiz.ejs", {
        title: quizName.name,
        questionLimit: 10,
        section: "link",
        level: "link",
        filelocation: "/public/link.json",
      });

      // return res.send({ data });
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});
module.exports = router;
