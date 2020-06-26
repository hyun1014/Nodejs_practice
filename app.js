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

var title = undefined;
var description = undefined;
var fli = fs.readdirSync(`./data`, 'utf-8'); // 이건 그냥 시험삼아 Sync로
var fli_template = template.make_list(fli);
var default_control = `<a href="/create">Create post</a>`; //기본 control
var target_control = default_control;
var ret_template = undefined;

app.get('/', (req, res) => {
    title = 'Index';
    description = "Express Practice";
    control = default_control;
    ret_template = template.make_html(title, fli_template, description, control);
    res.send(ret_template);
});

app.get('/page/:page', (req, res) => {
    title = path.parse(req.params.page).base;
    control = target_control;
    fs.readFile(`data/${title}`, 'utf-8', (err, data) => {
        description = sani_html(data);
        ret_template = template.make_html(title, fli_template, description, control);
        res.send(ret_template);
    });
});

app.get('/create', (req, res) => {
    title = 'Create';
    control = "Creating...";
    description = `
        <form action='/create_process' method='POST'>
            Title: <input type='text' name='title' placeholder='title'><br>
            Description:<br>
            <textarea name='description'>Input description</textarea><br>
            <input type='submit' value="Submit!">
        </form>
    `;
    ret_template = template.make_html(title, fli_template, description, control);
    res.send(ret_template);
});

app.post('/create_process', (req, res) => {
    var body = "";
    req.on('data', (data) => {
        body += data;

        if(body.length > 1e6) // 데이터 값이 너무 크면 연결 끊음
            req.socket.destroy();
    });
    req.on('end', (err) => {
        if(err){
            console.log(err);
            throw err;
        }
        var post_data = qs.parse(body);
        console.log(post_data); // post로 받은 값 확인
        var post_title = path.parse(post_data.title).base;
        var post_des = post_data.description;
        fs.writeFile(`./data/${post_title}`, post_des, 'utf-8', (err) => {
            fli.push(post_title); // 새로운 파일을 File list에 추가
            fli_template = template.make_list(fli); // List template update
            res.writeHead(302, {Location: `/page/${post_title}`});
            res.end();
        });
    });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log("Listening at port 3000...");
});