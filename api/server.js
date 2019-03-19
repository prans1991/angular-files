var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var os = require('os');
var ip = require('ip');
var Zip = require('node-zip');
var app = express();
var port = 4302;
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

var dirPath = os.homedir() + '/Documents/uploads/';

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
    var files = [];
    fs.readdir(dirPath, function (err, items) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].indexOf('.DS_Store') === -1) {
                files.push(items[i]);
            }
        }
        res.status(200).send({ list: files, ip: ip.address() });
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
                fileName = dirPath + file;
                fs.unlink(fileName, err => {
                    if (err) throw err;
                });
            }
            res.status(200).send('Files deleted successfully');
            break;
    }
});

app.listen(port, function () {
    console.log("Server started in port " + port);
}); 