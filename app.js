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
var control = `<a href="/create">Create post</a>`; //Create는 기본으로 항상 있음
var ret_template = undefined;

app.get('/', (req, res) => {
    title = 'Index';
    description = "Express Practice";
    ret_template = template.make_html(title, fli_template, description, control);
    res.send(ret_template);
});

app.get('/page/:page', (req, res) => {
    title = path.parse(req.params.page).base;
    fs.readFile(`data/${title}`, 'utf-8', (err, data) => {
        description = sani_html(data);
        ret_template = template.make_html(title, fli_template, description, control);
        res.send(ret_template);
    });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log("Listening at port 3000...");
});