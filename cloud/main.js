// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("getJwcCookie", function(request, response) {
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/UserPub/GetCjByXh.asp?UTp=Xs';
    var cookie = 'ASPSESSIONIDQCSSCSDD=DMMHGOODMFMAAMJEFJAEAJMG';
    var cheerio = require('cheerio');
    var iconv = require('iconv-lite');
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function (httpResponse) {
            console.log(httpResponse.headers);
            var html = iconv.decode(httpResponse.buffer, 'GBK');
            var $ = cheerio.load(html);
            var lastDiv = $("div").last();
            var courseNameArray = new Array();
            var courseScoreArray = new Array();
            var semesterStr = "学年";
            var tempSemesterStr;
            $("a",lastDiv).each(function (i, e) {
//                console.log('test');
//                console.log($(e).text());
//                console.log($(e).parent().text());
//                var temp = $(e).text();
                courseNameArray.push($(e).text());
            });
            $("font b",lastDiv).each(function (i, e) {
                var score = $(e).text();
                var attrBgcolor = $(e).parent().parent().attr('bgcolor');
                if(typeof (attrBgcolor) == 'undefined' || attrBgcolor == '#66EE66')
                {
                    if(score.indexOf(semesterStr) != -1)
                    {
                        tempSemesterStr = score;
                    }
                    else
                    {
                        var scoreObj = {'score':score, 'semester':tempSemesterStr};
//                        console.log(scoreObj);
                        courseScoreArray.push(scoreObj);
                    }
                }
            });
            console.log(courseNameArray);
            console.log(courseScoreArray);
            console.log(courseNameArray.length);
            console.log(courseScoreArray.length);
            response.success('success');
        },
        error: function (httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});


AV.Cloud.define("getVerifyCodePic", function(request, response) {
    var targetUrl = 'http://210.41.224.117/Login/xLogin/yzmDvCode.asp?k=552835&t=1429341700824';
    var cookie = '';
    var codeKey = '';
    var datePrama;
    AV.Cloud.run('getLoginCookieAndCodeKey', {}, {
        success: function(data){
            console.log("test");
            var cookiesArray = data['cookies'];
            for(var i = 0; i < cookiesArray.length; i++)
            {
                cookie += cookiesArray[i];
            }
            codeKey = data['codeKey'];
            datePrama = data['datePrama'];
            targetUrl = 'http://210.41.224.117/Login/xLogin/yzmDvCode.asp?k=' + codeKey + '&t=' +datePrama;

            var responseObj = {"url":targetUrl,"cookie":cookie,codeKey:codeKey};
            response.success(responseObj);
//            AV.Cloud.httpRequest({
//                url: targetUrl,
//                headers: {
//                    'Cookie': cookie,
//                    'Referer': 'http://210.41.224.117/Login/xLogin/Login.asp'
//                },
//                success: function(httpResponse) {
//                    console.log(httpResponse.text);
//                    console.log(httpResponse.headers);
////            response.success('success');
//                    response.success(httpResponse.text);
//                },
//                error: function(httpResponse) {
//                    console.error('Request failed with response code ' + httpResponse.status);
//                    response.success('Error ');
//                }
//            });
        },
        error: function(err){
            console.log(err);
            //处理调用失败
        }
    });
    console.log("i'm running");
});


AV.Cloud.define("getLoginCookieAndCodeKey", function(request, response) {
    var cheerio = require('cheerio');
    var semicolonStr = ';';
    AV.Cloud.httpRequest({
        url: 'http://210.41.224.117/Login/xLogin/Login.asp',
        success: function(httpResponse) {
            var codeKey;
            var $ = cheerio.load(httpResponse.text);
            $("input").each(function (i, e) {
                if($(e).attr('name') == 'codeKey')
                {
                    codeKey = $(e).attr('value');
                }
            });

            var untreatedCookiesArray = httpResponse.headers['set-cookie'];
            var handledCookieArray = new Array();

            for(var i = 0; i < untreatedCookiesArray.length; i++)
            {
                var cookieStr = untreatedCookiesArray[i];
                var lastIndex = cookieStr.indexOf(semicolonStr);
                var handledCookieStr = cookieStr.slice(0,lastIndex);
                handledCookieArray.push(handledCookieStr);
            }
            var dateParam = new Date().getTime();
            var responseObj = {cookies:handledCookieArray,codeKey:codeKey,datePrama:dateParam};
            response.success(responseObj);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("loginPost", function(request, response) {
    var cheerio = require('cheerio');
    var semicolonStr = ';';
    var cookie = '';
    var codeKey = '';

//    AV.Cloud.httpRequest({
//        method: 'POST',
//        url: 'http://210.41.224.117/Login/xLogin/Login.asp',
//        headers: {
//            'Cookie': 'ASPSESSIONIDCQSSDCAC=PBNBFBCCFBNEDOLMPEBINEIF',
//            'Referer': 'http://210.41.224.117/Login/xLogin/Login.asp'
//        },
//        body: {
//            txtId: '2011051023',
//            txtMM: 'Hn5201314',
//            WinW: '1600',
//            WinH: '860',
//            verifycode: 'ejt',
//            codeKey: '383190',
//            Login: 'Check'
//        },
//        success: function(httpResponse) {
//            console.log(httpResponse.text);
//            console.log(httpResponse.headers);
//            response.success('success');
//        },
//        error: function(httpResponse) {
//            console.error('Request failed with response code ' + httpResponse.status);
//            response.success('Error ');
//        }
//    });
});