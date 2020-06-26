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
            tmp_list += `<li><a href="/page/${flist[i]}">${flist[i]}</a></li>`
        tmp_list += `</ol>`
        return tmp_list;
    }
}

module.exports = template;