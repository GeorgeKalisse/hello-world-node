const http = require('http');
const port = process.env.PORT || 3000;
const cluster = process.env.CLUSTER || "non-prod";

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.end(`Hello Arctiq!\nThis is the ${cluster} cluster`);
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
