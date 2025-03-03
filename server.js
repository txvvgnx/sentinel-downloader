const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
    // Disable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    const filePath = path.join('./tiles', req.url);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not found');
        }
        res.writeHead(200);
        res.end(data);
    });
}).listen(8080, () => console.log('Server running on port 8080'));