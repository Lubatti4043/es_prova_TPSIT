// staticServer.js
const fs = require('fs');
const path = require('path');
const http = require('http');

class StaticServer {
    constructor(port, publicDir) {
        this.port = port;
        this.publicDir = publicDir;
        this.mimeTypes = {
            '.html' : 'text/html',
            '.css' : 'text/css',
            '.js' : 'application/javascript',
            '.png' : 'image/png',
            '.jpg' : 'image/jpeg',
            '.jpeg' : 'image/jpeg',
            '.gif' : 'image/gif',
            '.svg' : 'image/svg+xml',
            '.ico' : 'image/x-icon',
        };
    }

    getContentType(filePath) {
        return this.mimeTypes[path.extname(filePath)] || 'application/octet-stream';
    }

    serveStaticFile(filePath, res) {
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                this.serve404(res);
                return;
            }

            const contentType = this.getContentType(filePath);
            const headers = {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            };

            res.writeHead(200, headers);
            fs.createReadStream(filePath).pipe(res);
        });
    }

    serve404(res) {
        const filePath = path.join(this.publicDir, '404.html');
        fs.readFile(filePath, 'utf-8', (err, content) => {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content || '<h1>404 - Pagina non trovata</h1>');
        });
    }
}