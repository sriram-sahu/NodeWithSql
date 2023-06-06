const fs = require("fs");

const file = fs.readFileSync("./file.txt", "utf-8");

console.log(file);

fs.readFile("./file.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});

fs.writeFileSync("./files.txt", "hello world");

fs.writeFileSync("./files.txt", "hello sriram", { flag: "a" }, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("done");
  }
});
