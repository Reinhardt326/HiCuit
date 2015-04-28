// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("getCookieWithLibraryLoginPage", function(request, response) {
    var targetUrl = 'http://210.41.233.144:8080/reader/login.php';
    AV.Cloud.httpRequest({
        url: targetUrl,
        success: function(httpResponse) {
            var cookies = httpResponse.headers['set-cookie'];
            var number = request.params['username'];
            var passwd = request.params['passwd'];

            var cookie = cookies[0];
            var semicolonStr = ';';
            var lastIndex = cookie.indexOf(semicolonStr);
            var handledCookie = cookie.slice(0,lastIndex);
            AV.Cloud.run('libraryLoginPost', {cookie:handledCookie,number:number,passwd:passwd}, {
                success: function(data){
                    response.success(data);
                },
                error: function(err){
                    console.log(err);
                    //处理调用失败
                }
            });
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("libraryLoginPost", function(request, response) {
    var cookie = request.params['cookie'];
    var number = request.params['number'];
    var passwd = request.params['passwd'];

    AV.Cloud.httpRequest({
        method: 'POST',
        url: 'http://210.41.233.144:8080/reader/redr_verify.php',
        headers: {
            'Cookie': cookie,
        },
        body: {
            number: number,
            passwd: passwd,
            select: 'cert_no'
        },
        success: function(httpResponse) {
            var responseObj = {cookie:cookie};
            response.success(responseObj);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("getLibraryHomePage", function(request, response) {
    var targetUrl = 'http://210.41.233.144:8080/reader/redr_info.php';
    var cookie = request.params['cookie'];
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            console.log(httpResponse.text);
            response.success(httpResponse.headers);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("getCurrentBookList", function(request, response) {
    var targetUrl = 'http://210.41.233.144:8080/reader/book_lst.php';
    var cookie = request.params['cookie'];
    var cheerio = require('cheerio');
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            var $ = cheerio.load(httpResponse.text);
            var status;
            var responseObj;
            var myLibContent = $("div #mylib_content");
            var noRecordDiv = $("div .mylib_con_con,.pan_top", myLibContent);
            var bookListTable = $("table", myLibContent);
            if(noRecordDiv.length > 0)
            {
                status = 0;
                responseObj = {status:status};
            }
            if(bookListTable.length > 0)
            {
                status = 1;
            }

            response.success(responseObj);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("getHistoryBookList", function(request, response) {
    var targetUrl = 'http://210.41.233.144:8080/reader/book_hist.php';
    var cookie = request.params['cookie'];
    var cheerio = require('cheerio');
    AV.Cloud.httpRequest({
        method: 'POST',
        url: targetUrl,
        headers: {
            'Cookie': cookie
        },
        body: {
            para_string: 'all'
        },
        success: function(httpResponse) {
            var $ = cheerio.load(httpResponse.text);
            var status;
            var responseObj;
            var myLibContent = $("div #mylib_content");
            var noRecordDiv = $("div .mylib_con_con");
            var bookListTable = $("table", myLibContent);
            if(noRecordDiv.length > 0)
            {
                status = 0;
                responseObj = {status:status};
            }
            if(bookListTable.length > 0)
            {
                status = 1;
                var historyBookList = new Array();
                $("tr", bookListTable).each(function (i, e) {
                    var fieldFlag = 0;
                    var barCode;
                    var bookName;
                    var author;
                    var borrowDate;
                    var returnDate;
                    var position;
                    $("td", $(e)).each(function (i, e) {
                        if(fieldFlag == 1)
                        {
                            barCode = $(e).text();
                        }
                        else if(fieldFlag == 2)
                        {
                            bookName = $(e).text();
                        }
                        else if(fieldFlag == 3)
                        {
                            author = $(e).text();
                        }
                        else if(fieldFlag == 4)
                        {
                            borrowDate = $(e).text();
                        }
                        else if(fieldFlag == 5)
                        {
                            returnDate = $(e).text();
                        }
                        else if(fieldFlag == 6)
                        {
                            position = $(e).text();
                        }
                        fieldFlag++;
                    });
                    var bookObj = {barCode:barCode,bookName:bookName,author:author,borrowDate:borrowDate,returnDate:returnDate,position:position};
                    historyBookList.push(bookObj);
                });
                historyBookList.splice(0,1);

                responseObj = {status:status,historyBookList:historyBookList};
            }
            response.success(responseObj);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});