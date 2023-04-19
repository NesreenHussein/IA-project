const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("upload"));
const cors = require("cors");
app.use(cors()); //to communicate with frontend on local host

const auth = require("./routes/auth");
const Admin = require("./routes/admin");
const admin = require("./middleware/admin");

app.listen(4000, "localhost", () => {
  console.log("server is running");
});

//APIs routs [end points]
app.use("/auth", auth);
app.use("/admin", Admin);
