var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var os = require('os');
var ip = require('ip');
var http = require('http');
var filesize = require('filesize');
var app = express();
var server = http.createServer(app);
var port = 4302;
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

var dirPath = os.homedir() + '/Documents/uploads/';

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(dirPath)).listen(3013, function () {
  console.log('Files dir running on '+ip.address()+':3013');
});

var sockets = 0;
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
    sockets++;
    var watcher = fs.watch(dirPath, function (event, filename) {
            fs.readdir(dirPath, function (err, items) {
                let files;
                items = items.filter((item) => {
                   return item !== '.DS_Store';
                });
                console.log(items.length);
                if(items.length) {
                    files = [];
                    for (let i = 0; i < items.length; i++) {
                        var modifiedTime;
                        fs.stat(path.join(dirPath+items[i]), function(err, stats) {
                            modifiedTime = stats.mtime;
                            const fileSizeInBytes = stats.size;
                            const fileSize = filesize(fileSizeInBytes, { output: "object" });
                            var size = `${fileSize.value} ${fileSize.symbol}`;
                            let fileInfo = {
                                name: items[i],
                                modifiedTime: modifiedTime,
                                size: size,
                                checked: false
                            };
                            files.push(fileInfo);
                            if(i == items.length -1 ){
                                socket.emit('change', {list: files,ip: ip.address() });
                            }
                        });
                    }
                } else {
                    socket.emit('change', {list: files,ip: ip.address() });
                }
            });
    });
    io.emit('connections', sockets);
    var that = socket;
    socket.on('disconnect', function() {
      sockets--;
      io.emit('connections', sockets);
      watcher.close(); 
   });
});

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, dirPath);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({ storage: storage });

app.get('/ip', function (req, res) {
    res.status(200).send({ ip: ip.address() });
});

app.post('/upload', upload.array('uploads[]', 5), function (req, res) {
    res.status(200).send({ message: 'File(s) uploaded', ip: ip.address() });
});

app.get('/list', function (req, res) {
    let files;
    fs.readdir(dirPath, function (err, items) {
        items = items.filter((item) => {
           return item !== '.DS_Store';
        });
        if(items.length) {
            files = [];
            for (let i = 0; i < items.length; i++) {
                var modifiedTime;
                fs.stat(path.join(dirPath+items[i]), function(err, stats) {
                    modifiedTime = stats.mtime;
                    const fileSizeInBytes = stats.size;
                    const fileSize = filesize(fileSizeInBytes, { output: "object" });
                    var size =`${fileSize.value} ${fileSize.symbol}`;

                    let fileInfo = {
                        name: items[i],
                        modifiedTime: modifiedTime,
                        size: size,
                        checked: false
                    };
                    files.push(fileInfo);
                    if(i == items.length -1 ){
                        res.status(200).send({ list: files, ip: ip.address() });
                    }
                });
            }
        } else {
            res.status(200).send({ list: files, ip: ip.address()});
        }
    });
});

app.post('/delete', function (req, res) {
    var type = req.body.delete;

    switch (type) {
        case 'single':
            var fileName = req.body.fileName;
            fileName = dirPath + fileName;
            fs.unlink(fileName, function (err) {

                if (err) {
                    console.log('File not deleted' + err);
                    res.status(500).send('File not deleted');
                } else {
                    console.log('File deleted');
                    res.status(200).send('File deleted successfully');
                }
            });
            break;

        case 'all':
            fs.readdir(dirPath, (err, files) => {
                if (err) throw err;

                for (const file of files) {
                    fs.unlink(path.join(dirPath, file), err => {
                        if (err) throw err;
                    })
                }
                res.status(200).send('Files deleted successfully');
            });
            break;
        case 'selected':
            var files = req.body.files;
            var fileName;
            for (const file of files) {
                fileName = dirPath + file.name;
                fs.unlink(fileName, err => {
                    if (err) throw err;
                });
            }
            res.status(200).send('Files deleted successfully');
            break;
    }
});

server.listen(port, function () {
    console.log("API Server started in port "+ip.address()+":" + port);
}); 