const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const PORT = process.env.PORT || 3002;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const database = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "student_database",
});

function verifyToken(req, res, next) {
  const bearerToken = req.headers["authorization"];

  if (bearerToken) {
    var token = bearerToken.split(" ")[1];
  }
  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      res.status(404);
      res.send(err);
    }
    req.user = user;
    next();
  });
}

app.get("/", verifyToken, (req, res) => {
  const query = `select * from students`;
  database.query(query, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send(data);
    }
  });
});

app.post("/addStudent", verifyToken, (req, res) => {
  const { student_id, student_name, gender, city, age } = req.body;
  const query = `insert into students (student_id,student_name,gender,city,age) values (?,?,?,?,?)`;
  const values = [student_id, student_name, gender, city, age];

  database.query(query, values, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send("students added successfully");
    }
  });
});

app.post("/login", (req, res) => {
  const { student_id, email, password } = req.body;
  let query = "select * from students_login where student_id=? or email=?";
  let values = [student_id, email];
  database.query(query, values, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (results.length === 0) {
      res.send("User not found");
    } else {
      const user = results[0];
      console.log(user);
      bcrypt.compare(password, user.password, (error, data) => {
        if (error) {
          res.send("Something went wrong");
        }
        if (!data) {
          res.send("Password not matched");
        } else {
          const token = jwt.sign({ id: user.id }, "your_secret_key");
          res.json({ token });
        }
      });
    }
  });
});

app.post("/signup", (req, res) => {
  const { student_id, email, password } = req.body;
  let query = "select * from students_login where student_id=? or email=?";
  let values = [student_id, email];
  database.query(query, values, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (results.length > 0) {
      console.log(results);
      res.send("User Already Exists");
    } else {
      bcrypt.hash(password, 10, (error, hashedPassword) => {
        if (error) {
          res.json({ message: error });
        } else {
          const insertQuery =
            "insert into students_login (student_id,email,password) values (?,?,?)";
          const values = [student_id, email, hashedPassword];
          database.query(insertQuery, values, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.send("User created Successfully");
            }
          });
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
