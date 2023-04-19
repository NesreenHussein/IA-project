const router = require("express").Router();
const { log } = require("console");
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
//LOGIN

router.post(
  "/login",
  //el hagat eli bttb3t when register
  body("email").isEmail().withMessage("please enter a valid email"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),
  async (req, res) => {
    try {
      //1- validation req

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } //else

      //2-check if email exists
      //await/async
      const query = util.promisify(conn.query).bind(conn); //transform query mysql to promise to use await &a sync
      const checkEmailExists = await query(
        "select * from users where email =?",
        [req.body.email]
      );

      if (checkEmailExists.length == 0) {
        res.status(400).json({
          errors: [{ msg: "email or password is not found" }],
        });
      }

      //3- compare password

      const checkPassword = await bcrypt.compare(
        req.body.password,
        checkEmailExists[0].password
      );
      if (checkPassword) {
        delete checkEmailExists[0].password;
        res.status(200).json(checkEmailExists[0]);
      } else {
        res.status(404).json({
          errors: [
            {
              msg: "email or password not found !",
            },
          ],
        });
      }
    } catch (error) {
      console.log("ERROR!!!!!!!!!");
      console.log(error);
      res.status(500).json({ error: error + "error" });
    }
  }
);

//REGISTER
router.post(
  "/register",
  //el hagat eli bttb3t when register
  body("email").isEmail().withMessage("please enter a valid email"),
  body("name").isString().withMessage("please enter a valid name"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),
  body("phone"),

  async (req, res) => {
    try {
      //1- validation req

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } //else

      //check if email exists
      //await/async
      const query = util.promisify(conn.query).bind(conn); //transform query mysql to promise to use await &a sync
      const checkEmailExists = await query(
        "select * from users where email =?",
        [req.body.email]
      );

      if (checkEmailExists.length > 0) {
        res.status(400).json({
          errors: [{ msg: "email already exists" }],
        });
      }

      //prepare object user to save

      const userData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
        token: crypto.randomBytes(16).toString("hex"),
      };

      //  INSERT USER OBJECT INTO DB
      await query("insert into users set ? ", userData);
      delete userData.password;
      res.status(200).json(userData);

      res.json("success");
    } catch (error) {
      console.log("ERROR!!!!!!!!!");
      console.log(error);
      res.status(500).json({ error: error });
    }
  }
);

module.exports = router;
