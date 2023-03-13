'use strict'

var express = require('express');
var app = express();
const http = require('http');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

var fetch = require('node-fetch');

var annotations = [];

app.post("/annotation", function(req, res){
    console.log("post");
    var body = req.body;
    console.log("commentaire : ", body.commentaire);
    res.status(200);
})





app.get("/fetchair/shangai", function (req, res) {
    let url = "http://api.waqi.info/feed/shangai/?token=demo";
    fetch(url)
        .then(res => res.json())
        .then(json => {
            console.log("fetchair", json);

            res.format({
                'text/html': function () {
                    res.send("data fetched look your console");
                },
                'application/json': function () {
                    res.setHeader('Content-disposition', 'attachment; filename=score.json'); //do nothing
                    res.set('Content-Type', 'application/json');
                    res.json(json);
                },
                'application/rdf+xml': function () {
                    res.send("gonna send RDF XML");
                }
            })
        });
})

//define promisified httprequest 
function promHttpRequest(params) {
    return new Promise(function (resolve, reject) {
        var req = http.request(params, function (res) {
            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            // cumulate data
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            // resolve on end
            res.on('end', function () {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }
                console.log("promise http");
                resolve(body);
            });
        });
        // reject on request error
        req.on('error', function (err) {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });
        req.end();
    });
}


app.get("/httpreq/shangai", function (req, res) {
    var params = {
        host: 'api.waqi.info',
        method: 'GET',
        path: '/feed/shanghai/?token=demo'
    };
   
    promHttpRequest(params).then(function(body){
        console.log("httpreq", body);
        res.send("data hhtpreqed look your console");
    })
})

app.get("/doublecheck/shangai", function (req, res) {
    var params = {
        host: 'api.waqi.info',
        method: 'GET',
        path: '/feed/shanghai/?token=demo'
    };

    const promise1 = promHttpRequest(params) ;
    const url = "http://api.waqi.info/feed/shangai/?token=demo";
    const promise2 =  fetch(url) ;
    Promise.all([promise1, promise2]).then(function(values){
        console.log(values.length);
        console.log("promise 1 :", values[0]);
        values[1].json().then(function(value){ console.log("promise 2 :", value)});
        res.send("all promises resolved");
    });
})

app.listen(port, function () {

    console.log('Serveur listening on port ' + port);
});
