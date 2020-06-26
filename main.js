const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const url = require('url');
const { rawListeners } = require('process');

var template = {
    make_html: function(title, list, body, control){
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset='utf-8'>
                <title>nodejs - ${title}</title>
            </head>
            <body>
                <h1><a href='/'>Home</a></h1>
                ${list}
                <h2>${title}</h2>
                ${control}
                ${body}
            </body>
        <html>
        `
    },
    make_list: function(flist){
        var len = flist.length;
        var tmp_list = `<ol>
        `
        for(var i=0 ; i<len ; i++)
            tmp_list += `<li><a href="/?id=${flist[i]}">${flist[i]}</a></li>`
        tmp_list += `</ol>`
        return tmp_list;
    }
}


var app = http.createServer(function(req, res){
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(url.parse(_url, true)); // for test
    var title = undefined;
    var description = undefined;
    var fli = fs.readdirSync(`./data`, 'utf-8'); // 이건 그냥 시험삼아 비동기로
    var fli_template = template.make_list(fli);
    var control = ``;
    var ret_template = undefined;

    if(pathname=='/'){
        if(queryData.id===undefined){
            title = "Index";
            description = "First nodejs project";

            ret_template = template.make_html(title, fli_template, description, control);
            res.writeHead(200);
            res.write(ret_template);
            res.end();
        } 
        else{
            title = queryData.id;
            fs.readFile(`./data/${title}`, 'utf-8', (err, data) => {
                if(err){
                    console.log(err);
                    throw err;
                }
                description = data;
                ret_template = template.make_html(title, fli_template, description, control);
                res.writeHead(200);
                res.write(ret_template);
                res.end();
            });
        }
    }

});

app.listen(3000, '127.0.0.1');