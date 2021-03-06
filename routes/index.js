
/*
 * GET home page.
 */
var fs = require('fs');
var http = require('http');
var path = require('path');
var parser = require('xml2js');
var parseString = parser.parseString;
var handleUsers = require('../stores/users');
var weatherStore = require('../stores/weather');
var youBikeStore = require('../stores/youbike');

var db = require("../models/connectDB");

exports.weatherDailyJSON = function(req, res){
    weatherStore.getDaily(req.query.cityCode, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write(data);
        res.end();
    });
};

exports.weatherWeeklyJSON = function(req, res){
    weatherStore.getWeekly(req.query.cityCode, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write(data);
        res.end();
    });
};

exports.weather24HoursJSON = function(req, res){
    var query = req.query;
    weatherStore.get24Hours(query.cityCode, query.currentHour, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write(data);
        res.end();
    });
};

exports.getWeatherConditions = function (req, res) {
    var query = req.query;
    weatherStore.getWeatherConditions(query.city, query.country, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write(data);
        res.end();
    });
};

exports.getWeatherHourly = function (req, res) {
    var query = req.query;
    weatherStore.getWeatherHourly(query.city, query.country, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write(data);
        res.end();
    });
};

exports.getWeatherForecast5Day = function (req, res) {
    var query = req.query;
    weatherStore.getWeatherForecast5Day(query.city, query.country, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write(data);
        res.end();
    });
};

exports.yweather = function (req, res) {
    var options = {
        hostname : "weather.yahooapis.com/forecastrss",
        path: "/forecastrss?w=12703524&u=c"
    };
    var data;
    var request = http.get('http://weather.yahooapis.com/forecastrss?w=12703524&u=c', function (response) {
        console.log(response.statusCode);
        var data_xml = "";
        response.on('data', function (chunk) {
            data_xml += chunk.toString();
        });
        response.on('end', function () {
            parseString(data_xml, function (err, result) {
                var jsonResult = JSON.stringify(result.rss.channel[0]);
                res.render('yweather', {yweatherData:jsonResult});
            });
        });
    });
    request.on('error', function (e) {
        console.log(e);
    });
    request.end();
};

exports.store = function (req, res) {
    console.log(req);
    res.write("get it");
    res.end();
};

exports.youBikeJSON = function (req, res) {
    youBikeStore.get(function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write(data);
        res.end();
    });
};

exports.landscapeIcon = function (req, res) {
    if(req.method == 'GET'){
        console.log('GET coming');
    }
    var data;
    console.log("retrieving landscape icon");
        var request = http.get('http://data.kaohsiung.gov.tw/Opendata/DownLoad.aspx?Type=2&CaseNo1=AV&CaseNo2=1&FileType=1&Lang=C&FolderType=', function (response) {
        var data_json = "";
        response.on('data', function (chunk) {
            data_json += chunk.toString();
        });

        response.on('end', function () {
            parseString(data_json, function (err, result) {
                console.log("rending data...");
                jsonObj = JSON.parse(result.html.body[0].form[0].div[0].span[0]._);
                console.log(jsonObj[0].Name);
                res.render('landscapeIcon', {landscapeIconData:jsonObj});
            });            
        });
    });
    request.on('error', function (e) {
        console.log(e);
    });
    request.end();
};

exports.register = function(req, res) {
    console.log('hitting register page...');
    if(req.method == 'POST'){
        console.log('Post coming...');
        var insertValue = {};
        insertValue.account = req.body.userAccount;
        insertValue.password = req.body.password;
        //console.log(insertValue);

        //check if this account exists first
        db.execute("SELECT  * FROM account_info WHERE account = '" + req.body.userAccount +"'", function (error,result) {
            console.log('performing db selection in account_info');
            if (error) {
                console.log(error);
                res.send('fail to login');
                return;
            }
            console.log(result);
            if(Object.size(result) != 0){
                console.log('found account');
                res.send('601');
                return;                   
            } else {

                console.log("account not found, performing register");

                db.execute("INSERT INTO account_info VALUES ('"+ req.body.userAccount + "','" + req.body.password + "')", function (error,result) {
                    console.log('performing db insertion');
                    if (error) {
                        console.log(error);
                        res.send('280');
                        return;
                    }
                    console.log('insert account info : ' + result);

                    db.execute("INSERT INTO my_status VALUES ('"+ req.body.userAccount + "',0,0,0,0)", function (error,result) {
                        console.log('performing db insertion');
                        if (error) {
                            console.log(error);
                            res.send('280');
                            return;
                        }
                        console.log('insert my_status : ' + result);

                        db.execute("INSERT INTO settings VALUES ('"+ req.body.userAccount + "','Runner','01/01/2000','70','178')", function (error,result) {
                            console.log('performing db insertion in settings');
                            if (error) {
                                console.log(error);
                                res.send('280');
                                return;
                            }
                            console.log('insert settings : ' + result);
                        });

                    });
                    res.send('210');
                });                
            }
        });        
    }
};

exports.login = function(req, res) {
    console.log('hitting login page');
    if(req.method == 'POST'){
        var insertValue = {};
        insertValue.account = req.body.userAccount;
        insertValue.password = req.body.password;
        //console.log(insertValue);
        db.execute("SELECT  * FROM account_info WHERE account = '" + req.body.userAccount +"'", function (error,result) {
            console.log('performing db selection');
            if (error) {
                console.log(error);
                res.send('fail to login');
                return;
            }
            console.log(result);
            if(Object.size(result) != 0){
                console.log('found account');
                console.log('password: ' + result[0].password);
                returnedPassword = result[0].password;
                if(returnedPassword == req.body.password){
                    res.send('200');                    
                } else {
                    res.send('290');
                }
            } else {
                res.send('299');
                console.log('cannout find account');                 
            }
            
        });
    }
};

exports.getMyStatus = function(req, res) {
    console.log('hitting get my status page');
    if(req.method == 'POST'){
        var account = req.body.userAccount;
        db.execute("SELECT  * FROM my_status WHERE account = '" + req.body.userAccount +"'", function (error,result) {
            console.log('performing db selection');
            if (error) {
                console.log(error);
                res.send('fail to fetch my_status');
                return;
            }
            console.log(result);
            if(Object.size(result) != 0){
                console.log('found my_status');
                console.log('password: ' + result[0].password);
                returnedPassword = result[0].password;
                res.send('{ "times" : ' + result[0].times + ', "speeds" : ' +  result[0].speeds + ' , "calories" :  ' +  result[0].calories + ' , "distance" : ' +  result[0].distance + '}');
            } else {
                res.send('299');
                console.log('cannout find status');                 
            }
            
        });        
    }
};

exports.facebookLogin = function(req, res) {
    console.log('hitting facebook login page');
    if(req.method == 'POST'){
        var insertValue = {};
        insertValue.account = req.body.userAccount;
        //console.log(insertValue);
        db.execute("SELECT  * FROM account_info WHERE account = '" + req.body.userAccount +"'", function (error,result) {
            console.log('performing db selection');
            if (error) {
                console.log(error);
                res.send('fail to login');
                return;
            }
            console.log(result);
            if(Object.size(result) != 0){
                console.log('found facebook account');
                res.send('200');                    
            } else {
                //cannot find facebook account means this is the first time to use this facebook account to login
                db.execute("INSERT INTO account_info VALUES ('"+ req.body.userAccount + "','facebook')", function (error,result) {
                    console.log('performing db insertion');
                    if (error) {
                        console.log(error);
                        res.send('280');
                        return;
                    }
                    console.log('insert account_info : ' + result);

                    db.execute("INSERT INTO settings VALUES ('"+ req.body.userAccount + "','Runner','01/01/2000','70','178')", function (error,result) {
                        console.log('performing db insertion in settings');
                        if (error) {
                            console.log(error);
                            res.send('280');
                            return;
                        }
                        console.log('insert settings : ' + result);
                        res.send("200");
                    });                     
                });                               
            }
            
        });
    }
};

exports.getSettingInfo = function(req, res) {
    console.log('hitting getSettingInfo page');
    if(req.method == 'POST'){
        var insertValue = {};
        insertValue.account = req.body.userAccount;
        insertValue.password = req.body.password;
        //console.log(insertValue);
        db.execute("SELECT  * FROM settings WHERE account = '" + req.body.userAccount +"'", function (error,result) {
            console.log('performing db selection');
            if (error) {
                console.log(error);
                res.send('fail to login');
                return;
            }
            console.log(result);
            if(Object.size(result) != 0){
                console.log('found account');
                returnedPassword = result[0].password;
                var jsonResult = "{'fullName' : '" + result[0].full_name + "' , 'birthday' : '" + result[0].birthday + "', 'weight' : '" + result[0].weight + "', 'height' : '" + result[0].height + "'}";
                res.send(jsonResult);                    
            } else {
                res.send('603');
                console.log('cannout find settings');                 
            }
            
        });
    }
};

exports.updateSettings = function(req, res) {
    console.log('hitting updateSettings page');
    if(req.method == 'POST'){
        var insertValue = {};
        insertValue.account = req.body.userAccount;
        insertValue.fullName = req.body.fullName;
        insertValue.birthday = req.body.birthday;
        insertValue.weightValue = req.body.weightValue;
        insertValue.heightValue = req.body.heightValue;
        //console.log(insertValue);
        db.execute("UPDATE settings SET full_name = '"+ req.body.fullName +"', birthday = '" +  req.body.birthday + "', weight = '" + req.body.weightValue + "', height = '" + req.body.heightValue +  "' WHERE account = '" + req.body.userAccount +"'", function (error,result) {
            console.log('performing db udpate');
            if (error) {
                console.log(error);
                res.send('fail to update');
                return;
            }
            console.log(result);
            res.send('220');                        
        });
    }
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
