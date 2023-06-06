const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//file system,local

const app = express();
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "student_database",
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.put("/students/:id", (req, res) => {
  const Id = req.params.id;
  const student_id = req.body.StudentId;
  const student_name = req.body.studentName;
  const age = req.body.studentAge;
  const gender = req.body.Gender;
  const city = req.body.City;

  const q =
    "UPDATE students SET `student_id`=?, `student_name`=?, `age`=?, `gender`=?, `city`=? WHERE student_id=?";

  const values = [student_id, student_name, age, gender, city, Id];

  db.query(q, values, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }

    return res.json("Student record has been updated successfully");
  });
});

app.get("/", (req, res) => {
  const sql = "SELECT * FROM students order BY student_id";
  db.query(sql, (err, result) => {
    if (err) {
      return res.json({ Message: "Error inside server" });
    }
    return res.json(result);
  });
});

app.delete("/deleteStudent/:id", (req, res) => {
  const id = req.params.id;
  const q = "DELETE FROM students WHERE student_id=?";
  const values = [id];

  db.query(q, values, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (data.affectedRows === 0) {
      return res.status(404).json("Student record not found");
    }

    return res.json("Student record has been deleted successfully");
  });
});

app.post("/students", (req, res) => {
  console.log(req.body);
  const { student_id, student_name, age, gender, city } = req.body;

  const q =
    "INSERT INTO students (student_id, student_name, age, gender, city) VALUES (?, ?, ?, ?, ?)";
  const values = [student_id, student_name, age, gender, city];

  db.query(q, values, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }

    return res.json("Student record has been created successfully");
  });
});

app.post("/login", (req, res) => {
  const { student_id, email, password } = req.body;
  const query =
    "SELECT * FROM students_login WHERE student_id = ? OR email = ?";
  db.query(query, [student_id, email], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      return res.json({ message: "Server error" });
    }
    if (results.length === 0) {
      return res.json({ message: "User not found" });
    }
    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.json({ message: "Server error" });
      }

      if (!isMatch) {
        return res.json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id }, "your_secret_key");
      res.json({ token });
    });
  });
});

// Signup route
app.post("/signup", (req, res) => {
  const { student_id, email, password } = req.body;
  const checkQuery =
    "SELECT * FROM students_login WHERE student_id = ?  or email = ?";
  db.query(checkQuery, [student_id, email], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      return res.json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.json({ message: "User already exists" });
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
  });
});

app.listen(3000, () => {
  console.log("Server is running at 3000");
});
