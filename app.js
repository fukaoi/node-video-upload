/**
 * Module dependencies.
 */
var express = require('express'),
    form = require('connect-form'),
    mongoose = require('mongoose'),
    util = require('util'),
    sys = require('sys'),
    fs = require('fs'),
    routes = require('./routes'),
    ejs = require('ejs'),
    Post;

var app = module.exports = express.createServer(
        form({keepExtensions: true}));

//====== Configuration =======//
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.logger());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ 
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('development', function() {
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

//====== Mongoose object =======//
var RegProvider = require('./regprovider').RegProvider;

//====== Index page =======//
app.get('/', function(req, res) {
    RegProvider.findAll(function(req, posts) {
        res.render('index',
            {locals: {title: 'Mongo Node.js 動画アップロード',
                posts: posts}});
    })
});

//====== Create video file =======//
app.get('/videos/new', function(req, res) {
    res.render('reg_new',
        {locals: {title: '新規アップロード'}}
    );
});

//====== Update video =======//
app.post('/videos', function(req, res, next) {
    req.form.complete(function(err, fields, files) {
        console.log('here i go');
        if (err) return next(err);

        ins = fs.createReadStream(files.file.path);
        console.log('filename:' + files.file.filename);
        ous = fs.createWriteStream(__dirname + '/public/uploads/videos/' + files.file.filename);
        util.pump(ins, ous, function(err) {
            if (err) return next(new Error(err));

            RegProvider.save({
                filename: fields.filetitle,
                file: files.file.filename
            }, function(error, docs) {
                res.redirect('/')
            });
        });
    });

    req.form.on('progress', function(bytesReceived, bytesExpected) {
        var percent = (bytesReceived / bytesExpected * 100) | 0;
        console.log('Uploading: ' + percent + '%');
    });
});



//====== Show uploaded video =======//
app.get('/posts/:id', function(req, res) {
    RegProvider.findById(req.param('id'), function(error, post) {
        res.render('reg_show', {
            locals: {
                title: '詳細ページ',
                post:post
            }
        });
    });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
