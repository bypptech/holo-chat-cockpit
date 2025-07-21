const http = require('http');

const PORT = 4005;

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    const randomValue = Math.floor(Math.random() * 100);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ random: randomValue }));
  } else {
    res.writeHead(405);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
