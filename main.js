const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const url = require('url');

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
                ${control}<br /><br />
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
    var control = `<a href="/create">Create post</a>`;
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
    else if(pathname=='/create'){
        title = 'Create';
        description = `
            <form action='/create_process' method='POST'>
                Title: <input type='text' name='title' placeholder='title'><br>
                Description:<br>
                <textarea name='description'>Input description</textarea><br>
                <input type='submit' value="Submit!">
            </form>
        `;
        control = "Creating...";
        ret_template = template.make_html(title, fli_template, description, control);
        res.writeHead(200);
        res.write(ret_template);
        res.end();
    }
    else if(pathname=='/create_process'){
        if(req.method=='POST'){
            var body = "";
            req.on('data', (data) => {
                body += data;

                if(body.length > 1e6) // 데이터 값이 너무 크면 연결 끊음
                    req.socket.destroy();
            });
            req.on('end', (err) => {
                var post_data = qs.parse(body);
                console.log(post_data); // post로 받은 값 확인
                var post_title = post_data.title;
                var post_des = post_data.description;
                fs.writeFile(`./data/${post_title}`, post_des, 'utf-8', (err) => {
                    res.writeHead(302, {Location: `/?id=${post_title}`});
                    res.end();
                });
            });
        }
        else{
            console.log("Issue: Illegal access to create_process (GET)");
            res.writeHead(302, {Location: `/create`});
            res.end();
        }
    }
});

app.listen(3000, '127.0.0.1');