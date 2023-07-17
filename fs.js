const fs = require("fs");

const file = fs.readFileSync("file.txt");

console.log(file);

fs.readFile("file.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});

fs.writeFileSync("file.txt", "hello world");

fs.writeFileSync("file.txt", "hello sriram", { flag: "a" }, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("done");
  }
});

fs.appendFileSync("file.txt", "hello again");
