const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "student_database",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.listen(3004, () => {
  console.log("app running at port " + 3004);
});

function verifyToken(req, res, next) {
  const authToken = req.headers["authorization"];
  if (authToken) {
    const token = authToken.split(" ")[1];
    jwt.verify(token, "myToken", (err, data) => {
      if (err) {
        return res.status(401).send("Invalid token");
      }
      next();
    });
  } else {
    return res.status(401).send("Provide authToken");
  }
}

app.get("/", verifyToken, (req, res) => {
  let query = "select * from students";
  db.query(query, (err, data) => {
    if (err) {
      res.send(err);
    }
    res.send(data);
  });
});

app.post("/addStudent", (req, res) => {
  const { student_id, student_name, gender, city, age } = req.body;
  console.log(req.body);
  let query =
    "insert into students (student_id,student_name,gender,city,age) values(?,?,?,?,?)";
  values = [student_id, student_name, gender, city, age];
  db.query(query, values, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Student added successfully");
    }
  });
});

app.delete("/deleteStudent/:id", (req, res) => {
  const id = req.params.id;
  let query = `delete from students where student_id=${id}`;

  db.query(query, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send("student deleted successfully");
    }
  });
});

app.post("/login", (req, res) => {
  const { student_id, email, password } = req.body;
  let query = `select * from students_login where student_id=? or email=?`;
  let value = [student_id, email];
  db.query(query, value, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data.length === 0) {
        res.send("No student Found ");
      }
      const user = data[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          res.send(err);
        }
        if (!isMatch) {
          res.send("Password not matched");
        } else {
          const jwtToken = jwt.sign({ id: user.id }, "myToken");
          res.send(jwtToken);
        }
      });
    }
  });
});

app.post("/signup", (req, res) => {
  let { student_id, email, password } = req.body;
  let query = `select * from students_login where student_id=? or email=?`;
  let values = [student_id, email];
  db.query(query, values, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data.length !== 0) {
        res.send("user already exists");
      }
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res.send("Server error");
        }

        const insertQuery =
          "INSERT INTO students_login (student_id,email, password) VALUES (?,?,?)";
        db.query(
          insertQuery,
          [student_id, email, hashedPassword],
          (err, results) => {
            if (err) {
              console.error("Error executing MySQL query:", err);
              return res.json({ message: "Server error" });
            }

            res.json({ message: "User registered successfully" });
          }
        );
      });
    }
  });
});
