import http from 'http';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Enable CORS for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Serve the frontend HTML
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading page');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });

  } 
  // Handle button POST requests
  else if (req.method === 'POST' && req.url === '/select-topic') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        // Forward request to Python microservice
        const pyRes = await fetch('http://localhost:5000/process-topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const pyData = await pyRes.json();

        let messageText;

        if (pyData.message?.parts && pyData.message.parts[0]?.text) {
          messageText = pyData.message.parts[0].text;
        } else if (typeof pyData.message === 'string') {
          messageText = pyData.message;
        } else {
          messageText = "Error fetching description";
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: messageText }));


      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error contacting Python service' }));
      }
    });
  } 

  // Catch-all for other routes
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => console.log(`Server running on port ${port}`));
