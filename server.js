// import modules
const http = require('http'); 
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class Emitter extends EventEmitter {};
const emitter = new Emitter();

const PORT = process.env.PORT || 8080;

// Create function that serves file
const serveFile = async (filePath,contentType,response,statusCode) => {
    try {
        const data = await fsPromises.readFile(filePath, !contentType.includes('image') ?'utf8':'');

        const parsedData = contentType === 'application/json' ? JSON.parse(data) : data ;
        response.writeHead(statusCode, {'Content-type': contentType});
        response.end(
            contentType === 'application/json' ? JSON.stringify(parsedData) : data
        );
    } catch (err) {
        console.log("Error: ", err.message);
        response.statusCode(500);
        response.end();
    }
};

// Create http server
const server = http.createServer((request,response) => {


    // Create file extension for Content-type
    const extension = path.extname(request.url);
    let contentType;

    switch (extension) {
        case '.txt':
            contentType = 'text/plain';
            break;
        case '.css':
            contentType = 'text/css';           // for css file
            break;
        case '.Js':
            contentType = 'text/javascript';    // for js file
            break;
        case '.json':
            contentType = 'application/json';   // for json file
            break;
        case '.jpg':
            contentType = 'image/jpeg';         // for image.jpg 
            break;
        case '.png':
            contentType = 'image/png';          // for image.png
            break;

        default:
            contentType = 'text/html';          // html file as a default.
    }


    let filePath = 
        contentType === 'text/html' && request.url ==='/'
            ?path.join(__dirname,'src','index.html')
            :contentType === 'text/html' && request.url.slice(-1) === '/' 
                ?path.join(__dirname,'src',request.url,'index.html')
                :contentType === 'text/html'
                    ?path.join(__dirname,'src', request.url)
                    :path.join(__dirname,request.url);

    if(!extension && request.url.slice(-1) !== '/') filePath += '.html';

    if (fs.existsSync(filePath)) {
        // Serve 200 
        serveFile(filePath,contentType,response,200);
    } else {
        // Serve 404
        serveFile(path.join(__dirname,'src','404.html'),'text/html',response,404);
    }


});

server.listen(PORT, () => {
    console.log("Server is runnng on port 8080...");
});