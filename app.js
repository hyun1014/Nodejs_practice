const express = require('express');
const app = express();
const PORT = 3000;
const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const url = require('url');
const template = require('./lib/template_express.js');
const path = require('path');
const sani_html = require('sanitize-html');
const body_parser = require('body-parser');
const compression = require('compression');
const pageRouter = require('./routers/pageRouter');

var title = undefined;
var description = undefined;
var fli = fs.readdirSync(`./data`, 'utf-8'); // 이건 그냥 시험삼아 Sync로
var fli_template = template.make_list(fli);
var default_control = `<a href="/page/create">Create post</a>`; //기본 control
//var target_control = '<a href="/update/${title}">Update this post</a>'; 얘는 안됨
var ret_template = undefined;

app.use(body_parser.urlencoded({extended: false}));
app.use(compression());
app.use(function(req, res, next){
    fs.readdir('./data', 'utf-8', (err, files) => {
        req.flist = files;
        next();
    });
});
app.use(express.static('static'));

app.get('/', (req, res) => {
    title = 'Index';
    description = "Express Practice";
    fli = req.flist;
    fli_template = template.make_list(fli);
    control = default_control;
    ret_template = template.make_html(title, fli_template, description + `<img src='/images/sample.jpg' style="width:500px; height:350px; display:block;">`, control);
    res.send(ret_template);
});

app.use('/page', pageRouter);

app.get(`/update/:target`, (req, res) => {
    var parsed_queryid = path.parse(req.params.target).base;
    title = `Updating ${parsed_queryid}`;
    control = "Updating...";
    fli = req.flist;
    fli_template = template.make_list(fli);
    fs.readFile(`./data/${parsed_queryid}`, 'utf-8', (err, data) => {
        if(err){
            console.log(err);
            throw err;
        }
        description = `
        <form action='/update_process' method='POST'>
            <input type='hidden' name='origin_title' value=${parsed_queryid}>
            Title: <input type='text' name='title' value=${parsed_queryid}><br>
            Description:<br>
            <textarea name='description'>${data}</textarea><br>
            <input type='submit' value="Submit!">
        </form>
        `;
        ret_template = template.make_html(title, fli_template, description + `<img src='/images/sample.jpg' style="width:500px; height:350px; display:block;">`, control);
        res.writeHead(200);
        res.write(ret_template);
        res.end();
    });
});

app.post('/update_process', (req,res) => {
    var post_data = req.body;
    console.log(post_data); // post로 받은 값 확인
    var post_origin_title = path.parse(post_data.origin_title).base;
    var post_title = path.parse(post_data.title).base;
    var post_des = post_data.description;
    fs.rename(`data/${post_origin_title}`, `data/${post_title}`, () => {
        fs.writeFile(`data/${post_title}`, post_des, 'utf-8', () => {
            // File list update
            // if(post_origin_title != post_title){
            //     var new_fli = [];
            //     var fli_len = fli.length;
            //     for(var i=0 ; i<fli_len ; i++)
            //         if(fli[i] != post_origin_title)
            //             new_fli.push(fli[i]);
            //     new_fli.push(post_title);
            //     fli = new_fli;
            //     fli_template = template.make_list(new_fli);
            // }
            // File list update done
            /*
            Read 부분에서 fs.readdir 이걸 계속 썼으면 이게 필요없다. Async가 이래서 좋은건가
            */
            res.redirect(`/page/${post_title}`);
        });
    });
});

app.post('/delete_process', (req, res) => {
    var post_data = req.body;
    console.log(post_data); // post로 받은 값 확인
    var post_target = path.parse(post_data.target).base;
    fs.unlink(`data/${post_target}`, () => {
        // File list update
        // var new_fli = [];
        // var fli_len = fli.length;
        // for(var i=0 ; i<fli_len ; i++)
        //     if(fli[i] != post_target)
        //         new_fli.push(fli[i]);
        // fli = new_fli;
        // fli_template = template.make_list(new_fli);
        // File list update done
        res.redirect('/');
    });
});

app.use('/page/:page', function(req, res, next){ //test용 callback function
    console.log("Dummy callback function");
});

app.use(function(req, res, next){
    res.status(404).send("404 page not found");
});

app.use(function(err, req, res, next){
    console.log(err.stack);
    res.status(500).send("Error occured...");
});

app.listen(PORT, '127.0.0.1', () => {
    console.log("Listening at port 3000...");
});