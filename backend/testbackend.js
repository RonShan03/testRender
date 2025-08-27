const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Enable CORS so frontend can call this from Render
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST' && req.url === '/select-topic') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); // collect incoming data
    });

    req.on('end', () => {
      const data = JSON.parse(body);
      const topic = data.topic || 'Unknown';

      // Example response — you can expand this later
      const response = { message: `Server received your selection: ${topic}` };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    });

  } else if (req.method === 'GET') {
    // Default response for testing
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
