const express = require('express');
const router = express.Router();
const template = require('../lib/template_express');
const fs = require('fs');
const path = require('path');
const sani_html = require('sanitize-html');

var title = undefined;
var description = undefined;
var fli = fs.readdirSync(`./data`, 'utf-8'); // 이건 그냥 시험삼아 Sync로
var fli_template = template.make_list(fli);
var default_control = `<a href="/page/create">Create post</a>`; //기본 control
//var target_control = '<a href="/update/${title}">Update this post</a>'; 얘는 안됨
var ret_template = undefined;

router.get('/:page', (req, res, next) => {
    title = path.parse(req.params.page).base;
    fli = req.flist;
    fli_template = template.make_list(fli);
    //control = default_control + " " + target_control; 얘는 안됨. ${title} 부분이 undefined로 채워짐
    control = default_control + " " + `<a href="/update/${title}">Update this post</a>` + " " +
    `<form action='/delete_process' method='POST'><input type='hidden' name='target' value=${title}><input type='submit' value='Delete'></form>`;
    fs.readFile(`./data/${title}`, 'utf-8', (err, data) => {
        if(err)
            next(err); // 이거 한다고 밑에 코드가 실행 안되는게 아님. (error handler middleware 실행되고 또 보내게 됨)
        else{
            description = sani_html(data);
            ret_template = template.make_html(title, fli_template, description + `<img src='/images/sample.jpg' style="width:500px; height:350px; display:block;">`, control);
            res.send(ret_template);
        }
    });
    if(true){
        next();
    }
    else{
        next('route');
    }
},
function(req, res, next){ //test용 callback function
    console.log("Dummy func in page url");
});

router.get('/create', (req, res) => {
    title = 'Create';
    control = "Creating...";
    fli = req.flist;
    fli_template = template.make_list(fli);
    description = `
        <form action='/page/create_process' method='POST'>
            Title: <input type='text' name='title' placeholder='title'><br>
            Description:<br>
            <textarea name='description'>Input description</textarea><br>
            <input type='submit' value="Submit!">
        </form>
    `;
    ret_template = template.make_html(title, fli_template, description + `<img src='/images/sample.jpg' style="width:500px; height:350px; display:block;">`, control);
    res.send(ret_template);
});

router.post('/create_process', (req, res) => {
    var post_data = req.body;
    var post_title = path.parse(post_data.title).base;
    var post_des = post_data.description;
    fs.writeFile(`./data/${post_title}`, post_des, 'utf-8', (err) => {
        // fli.push(post_title); // 새로운 파일을 File list에 추가
        // fli_template = template.make_list(fli); // List template update
        // res.redirect 이렇게도 가능 (아래)
        res.writeHead(302, {Location: `/page/${post_title}`});
        res.end();
    });
});

module.exports = router;