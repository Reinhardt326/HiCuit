// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("getJwcScore", function(request, response) {
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/UserPub/GetCjByXh.asp?UTp=Xs';
    var cookie = request.params['cookie'];
    var cheerio = require('cheerio');
    var iconv = require('iconv-lite');
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function (httpResponse) {
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
                        var scoreObj = {score:score, semester:tempSemesterStr};
//                        console.log(scoreObj);
                        courseScoreArray.push(scoreObj);
                    }
                }
            });
            var courseScoreInfoArray = new Array();
            for(var i = 0; i < courseNameArray.length; i++)
            {
                var scoreObj = courseScoreArray[i];
                var courseScoreObj = {courseName: courseNameArray[i], courseScore: scoreObj['score'], semester: scoreObj['semester']};
                courseScoreInfoArray.push(courseScoreObj);
            }
            response.success(courseScoreInfoArray);
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
    var cookie = request.params['cookie'];
    var codeKey = request.params['codeKey'];
    var username = request.params['username'];
    var pwd = request.params['pwd'];
    var verifyCode = request.params['verifyCode'];

    AV.Cloud.httpRequest({
        method: 'POST',
        url: 'http://210.41.224.117/Login/xLogin/Login.asp',
        headers: {
            'Cookie': cookie,
            'Referer': 'http://210.41.224.117/Login/xLogin/Login.asp'
        },
        body: {
            txtId: username,
            txtMM: pwd,
            WinW: '1600',
            WinH: '860',
            verifycode: verifyCode,
            codeKey: codeKey,
            Login: 'Check'
        },
        success: function(httpResponse) {
            response.success(httpResponse.headers);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});


AV.Cloud.define("qqLogin", function(request, response) {
    var targetUrl = 'http://210.41.224.117/Login/qqLogin.asp';
    var cookie = 'ASPSESSIONIDCSQQBADC=MDEHDLBCHKLGGMIFFMIPOGLA';
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            console.log(httpResponse.text);
            console.log(httpResponse.headers);
            response.success('success');
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("getJwcCookie", function(request, response) {
    var scoreUrl = 'http://jwc.cuit.edu.cn/Jxgl/Xs/MainMenu.asp';
    var loginCookie = request.params['loginCookie'];
    AV.Cloud.httpRequest({
        url: scoreUrl,
        success: function(httpResponse) {
            var untreatedCookiesArray = httpResponse.headers['set-cookie'];
            var untreatedCookie = untreatedCookiesArray[0];
            var lastIndex = untreatedCookie.indexOf(';');
            var handledCookie = untreatedCookie.slice(0,lastIndex);

            AV.Cloud.run('jwcTylogin', {cookie:handledCookie,loginCookie:loginCookie}, {
                success: function(data){
                    console.log('jwcTylogin return success!');
                    if(handledCookie == data)
                    {
                        var responseObj = {cookie:handledCookie}
                        response.success(responseObj);
                    }
                },
                error: function(err){
                    console.log(err);
                    //处理调用失败
                }
            });

//            response.success(handledCookie);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});


AV.Cloud.define("jwcTylogin", function(request, response) {
    var cheerio = require('cheerio');
    var iconv = require('iconv-lite');
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/Login/tyLogin.asp';
    var cookie = request.params['cookie'];
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            var refreshUrl = '';
            var location = httpResponse.headers['location'];
            if(typeof location == 'undefined')
            {
                var $ = cheerio.load(httpResponse.text);
                $("meta").each(function (i, e) {
                    if($(e).attr('http-equiv') == 'refresh')
                    {
                        var originalStr = $(e).attr('content');
                        var index = originalStr.indexOf('http');
                        refreshUrl = originalStr.slice(index);
                    }
                });
                var loginCookie = request.params['loginCookie'];
                AV.Cloud.run('qqLoginWithParam', {url:refreshUrl,loginCookie:loginCookie,jwcCookie:cookie}, {
                    success: function(data){
                        console.log('qqLoginWithParam return success');
                        response.success(data);
                    },
                    error: function(err){
                        console.log(err);
                        //处理调用失败
                    }
                });
            }
            else
            {
                AV.Cloud.run('getMainMenu', {cookie:cookie}, {
                    success: function(data){
                        console.log('jwcTyLogin getMainMenu return success');
                        response.success(data);
                    },
                    error: function(err){
                        console.log(err);
                        //处理调用失败
                    }
                });
            }
//            response.success('jwcTylogin Succees');
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});


AV.Cloud.define("qqLoginWithParam", function(request, response) {
    var targetUrl = request.params['url'];
    var cookie = request.params['loginCookie'];
    var jwcCookie = request.params['jwcCookie']
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            AV.Cloud.run('jwcTylogin', {cookie:jwcCookie}, {
                success: function(data){
                    console.log('jwcTylogin return success');
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

AV.Cloud.define("syLogin", function(request, response) {
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/Login/syLogin.asp';
    var cookie = 'ASPSESSIONIDASQQBRAA=NBPGKIOBCABMBKDNEGOCFANF';
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            console.log(httpResponse.text);
            console.log(httpResponse.headers);
            response.success('success');
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("getMainMenu", function(request, response) {
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/Xs/MainMenu.asp';
    var cookie = request.params['cookie'];
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            var location = httpResponse.headers['location'];
            if(typeof location == 'undefined')
            {
                //正常获取
                console.log("return cookie");
//                response.success(cookie);
                response.success(cookie);
            }
            else
            {
                if(location.indexOf('MainMenu') >= 0)
                {
//                    AV.Cloud.run('getMainMenu', {cookie:cookie}, {
//                        success: function(data){
//                            console.log('success');
//                        },
//                        error: function(err){
//                            console.log(err);
//                            //处理调用失败
//                        }
//                    });
                    console.log("main");
                }
                else if(location.indexOf('UserPub') >= 0)
                {
                    //导航到userPubLogin
                    AV.Cloud.run('userPubLogin', {cookie:cookie}, {
                        success: function(data){
                            console.log('userPubLogin return success');
                            response.success(data);
                        },
                        error: function(err){
                            console.log(err);
                            //处理调用失败
                        }
                    });
                }
            }
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("userPubLogin", function(request, response) {
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/UserPub/Login.asp?UTp=Xs';
    var cookie = request.params["cookie"];
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            AV.Cloud.run('getMainMenu', {cookie:cookie}, {
                success: function(data){
                    console.log('userPubLogin getMainMenu success');
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

AV.Cloud.define("userPubLoginWithParam", function(request, response) {
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/UserPub/Login.asp?UTp=Xs&Func=Login';
    var cookie = 'ASPSESSIONIDASQQBRAA=NBPGKIOBCABMBKDNEGOCFANF';
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            console.log(httpResponse.text);
            console.log(httpResponse.headers);
            response.success('success');
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});

AV.Cloud.define("getWindow", function(request, response) {
    var targetUrl = 'http://jwc.cuit.edu.cn/Jxgl/GetWindow.asp?Ret=%2FJxgl%2FUserPub%2FLogin%2Easp%3FUTp%3DXs';
    var cookie = 'ASPSESSIONIDASQQBRAA=KAAJKIOBNIPKBDJINKKDNGOC';
    AV.Cloud.httpRequest({
        url: targetUrl,
        headers: {
            'Cookie': cookie,
        },
        success: function(httpResponse) {
            console.log(httpResponse.text);
            console.log(httpResponse.headers);
            response.success('success');
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.success('Error ');
        }
    });
});