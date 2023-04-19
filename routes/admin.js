const router = require("express").Router();
const conn = require("../db/dbConnection");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper
bcrypt = require("bcrypt");
const crypto = require("crypto");

//---1-COURSES---\\

//create
router.post(
  "/create",
  admin,
  body("name")
    .isString()
    .withMessage("please enter a valid course name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
  body("status")
    .isString()
    .withMessage("please enter a valid status")
    .isLength({ max: 10 })
    .withMessage("please enter at most 1 character"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const course = {
        name: req.body.name,
        status: req.body.status,
      };
      const query = util.promisify(conn.query).bind(conn);
      await query("insert into courses set ? ", course);
      res.status(200).json({
        msg: "course created successfully !",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

//update
router.put(
  "/:id", // params
  admin,
  body("name")
    .isString()
    .withMessage("please enter a valid course name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
  body("status"),

  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF COURSE EXISTS OR NOT
      const course = await query("select * from courses where id = ?", [
        req.params.id,
      ]);
      if (!course[0]) {
        res.status(404).json({ ms: "course not found !" });
      }

      // 3- PREPARE COURSE OBJECT
      const courseObj = {
        name: req.body.name,
        status: req.body.status,
      };

      // 4- UPDATE COURSE
      await query("update courses set ? where id = ?", [
        courseObj,
        course[0].id,
      ]);

      res.status(200).json({
        msg: "course updated successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

//delete
router.delete(
  "/:id", // params
  admin,
  async (req, res) => {
    try {
      // 1- CHECK IF COURSE EXISTS OR NOT
      const query = util.promisify(conn.query).bind(conn);
      const course = await query("select * from courses where id = ?", [
        req.params.id,
      ]);
      if (!course[0]) {
        res.status(404).json({ ms: "course not found !" });
      }
      // 2- REMOVE COURSE

      await query("delete from courses where id = ?", [course[0].id]);
      res.status(200).json({
        msg: "course delete successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//______________________________________________________________________________\\

//---2-Instructors---\\
//create
router.post(
  "/createInstructor",
  admin,
  body("name")
    .isString()
    .withMessage("please enter a valid instructor name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
  body("status")
    .isString()
    .withMessage("please enter a valid status")
    .isLength({ max: 5 })
    .withMessage("please enter at most 1 character"),
  body("email").isString().withMessage("please enter a valid email"),
  body("password")
    .isString()
    .withMessage("please enter a valid password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),

  body("role")
    .isString()
    .withMessage("please enter a valid role")
    .isLength({ max: 5 })
    .withMessage("please enter a valid role"),
  body("phone"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const instructor = {
        name: req.body.name,
        status: req.body.status,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
        role: req.body.role,
        token: crypto.randomBytes(16).toString("hex"),
      };
      const query = util.promisify(conn.query).bind(conn);
      await query("insert into users set ? ", instructor);
      res.status(200).json({
        msg: "instructor created successfully !",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

//update
router.put(
  "/updateInstructor/:id", // params
  admin,
  body("name")
    .isString()
    .withMessage("please enter a valid instructor name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
  body("status")
    .isString()
    .withMessage("please enter a valid status")
    .isLength({ max: 5 })
    .withMessage("please enter at most 1 character"),
  body("email").isString().withMessage("please enter a valid email"),
  body("password")
    .isString()
    .withMessage("please enter a valid password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),
  body("phone"),

  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF Instructor EXISTS OR NOT
      const instructor = await query("select * from users where id = ?", [
        req.params.id,
      ]);
      if (!instructor[0]) {
        res.status(404).json({ ms: "instructor not found !" });
      }

      // 3- PREPARE instructor OBJECT
      const instructorObj = {
        name: req.body.name,
        status: req.body.status,
        email: req.body.email,
        phone: req.body.phone,
        temp: req.body.temp,
        password: await bcrypt.hash(req.body.password, 10),
      };

      // 4- UPDATE COURSE
      await query("update users set ? where id = ?", [
        instructorObj,
        instructor[0].id,
      ]);

      res.status(200).json({
        msg: "instructor updated successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

//delete
router.delete(
  "/deleteInstructor/:id", // params
  admin,
  async (req, res) => {
    try {
      // 1- CHECK IF instructor EXISTS OR NOT
      const query = util.promisify(conn.query).bind(conn);
      const instructor = await query("select * from users where id = ?", [
        req.params.id,
      ]);
      if (!instructor[0]) {
        res.status(404).json({ ms: "instructor not found !" });
      }
      // 2- REMOVE instructor
      await query("delete from users where id = ?", [instructor[0].id]);
      res.status(200).json({
        msg: "deleted instructor successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);
//__________________________________________________________________________________\\

//---3-Assign Instructors to Courses---\\
router.post(
  "/AssignInstructor/:id", // params
  admin,
  body("name")
    .isString()
    .withMessage("please enter a valid instructor name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),

  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF Instructor EXISTS OR NOT
      const instructor = await query("select * from users where id = ?", [
        req.params.id,
      ]);
      if (!instructor[0]) {
        res.status(404).json({ ms: "instructor not found !" });
      }
      // 2- CHECK IF course EXISTS OR NOT
      const course = await query("select * from courses where name = ?", [
        req.body.name,
      ]);
      if (!course[0]) {
        res.status(404).json({ ms: "course not found !" });
      }

      // 3- PREPARE instructor OBJECT
      const instructorObj = {
        instructor_id: instructor[0].id,
      };

      // 4- ASSIGN COURSE
      await query("update courses set ? where name = ?", [
        instructorObj,
        req.body.name,
      ]);

      res.status(200).json({
        msg: "assign updated successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

module.exports = router;
