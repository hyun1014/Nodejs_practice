const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const url = require('url');
const template = require('./lib/template.js');

var app = http.createServer(function(req, res){
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(url.parse(_url, true)); // for test
    var title = undefined;
    var description = undefined;
    var fli = fs.readdirSync(`./data`, 'utf-8'); // 이건 그냥 시험삼아 비동기로
    var fli_template = template.make_list(fli);
    var control = `<a href="/create">Create post</a>`; //Create는 기본으로 항상 있음
    var ret_template = undefined;
    // Read Start
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
            control += `&nbsp;&nbsp;<a href='/update?id=${title}'>Update</a>&nbsp;&nbsp;
            <form action='/delete_process' method='POST'><input type='hidden' name='target' value=${title}><input type='submit' value='Delete'></form>
            `; //Target이 있는 경우 Update, Delete 선택지 추가, Delete는 POST로 처리
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
    // Read End
    // Create Start
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
                if(err){
                    console.log(err);
                    throw err;
                }
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
    // Create End
    // Update Start
    else if(pathname=='/update'){
        title = `Updating ${queryData.id}`;
        control = "Updating...";
        fs.readFile(`./data/${queryData.id}`, 'utf-8', (err, data) => {
            if(err){
                console.log(err);
                throw err;
            }
            description = `
            <form action='/update_process' method='POST'>
                <input type='hidden' name='origin_title' value=${queryData.id}>
                Title: <input type='text' name='title' value=${queryData.id}><br>
                Description:<br>
                <textarea name='description'>${data}</textarea><br>
                <input type='submit' value="Submit!">
            </form>
            `;
            ret_template = template.make_html(title, fli_template, description, control);
            res.writeHead(200);
            res.write(ret_template);
            res.end();
        });
    }
    else if(pathname=='/update_process'){
        if(req.method=='POST'){
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
                var post_origin_title = post_data.origin_title;
                var post_title = post_data.title;
                var post_des = post_data.description;
                fs.rename(`data/${post_origin_title}`, `data/${post_title}`, () => {
                    fs.writeFile(`data/${post_title}`, post_des, 'utf-8', () => {
                        res.writeHead(302, {Location: `/?id=${post_title}`});
                        res.end();
                    });
                });
            });
        }
        else{
            console.log("Issue: Illegal access to create_process (GET)");
            res.writeHead(302, {Location: `/`});
            res.end();
        }
    }
    // Update End
    // Delete Start
    else if(pathname=='/delete_process'){
        if(req.method=='POST'){
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
                var post_target = post_data.target;
                fs.unlink(`data/${post_target}`, () => {
                    res.writeHead(302, {Location: '/'});
                    res.end();
                });
            });
        }
        else{
            console.log("Issue: Illegal access to create_process (GET)");
            res.writeHead(302, {Location: `/`});
            res.end();
        }
    }
    else{
        res.writeHead(404);
        res.end("404 not found");
    }
    // Delete End
});

app.listen(3000, '127.0.0.1');