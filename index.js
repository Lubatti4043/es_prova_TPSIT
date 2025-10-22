const http = require('http');
const fs = require('fs');
const path = require('path');
//--------------------------------------------------------------------
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
//--------------------------------------------------------------------
//Mappa delle estensioni ai tipi di contenuto
const mimeTypes = {
    '.html': 'text/html',
    '.css' : 'text/css',
    '.js' : 'application/javascript',
    '.png' : 'image/png',
    '.jpg' : 'image/jpeg',
    '.jpeg' : 'image/jpeg',
    '.gif' : 'image/gif',
    '.svg' : 'image/svg+xml',
    '.ico' : 'image/x-icon',
};
//--------------------------------------------------------------------
// Funzione per determinare il tipo di contenuto
const getContentType = (filePath) => mimeTypes[path.extname(filePath)] || 'application/octet-stream';
//--------------------------------------------------------------------
// Funzione per servire file statici
const serveStaticFile = (filePath, res) => {
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            serve404(res);  // File non trovato
            return;
        }

        const contentType = getContentType(filePath);
        const headers = {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',    // Caching di un'ora
        };

        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);    //Usa lo streaming per efficienza
    });
};
//--------------------------------------------------------------------
// Funzione per servire la pagina 404
const serve404 = (res) => {
    const filePath = path.join(PUBLIC_DIR, '404.html');
    fs.readFile(filePath, 'utf-8', (err, content) => {
        res.writeHead(404, { 'Content-Type' : 'text/html' });
        res.end(content || '<h1>404 - Pagina non trovata </h1>');
    });
};
//--------------------------------------------------------------------
// Funzione per prevenire il directory traversal
const getSafePath = (url) => {
    console.log(url);
    const normalizedPath = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
    console.log(normalizedPath);
    return path.join(PUBLIC_DIR, url === '/' ? 'index.html' : normalizedPath);
};
//--------------------------------------------------------------------
// Funzione principale del server
const handleRequest = (req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Gestisci solo richieste GET
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'text/plain '});
        res.end('Metodo non consentito');
        return;
    }

    // Ottieni il percorso sicuro del file richiesto
    const filePath = getSafePath(req.url);
    serveStaticFile(filePath, res);
};
//--------------------------------------------------------------------
// Creazione del server HTTP
const server = http.createServer((req, res) => {
    try {
        handleRequest(req, res);
    }
    catch (err) {
        console.error(`Errore del server: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text-plain' });
        res.end('Errore interno del server');
    }
});
//--------------------------------------------------------------------
// Avvio del server
server.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
