const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("home");
  } else if (req.url === "/about") {
    res.end("about");
  } else {
    res.writeHead(404);
    res.end("not found");
  }
});

server.listen(3001, () => {
  console.log(`server is running at 3001`);
});
