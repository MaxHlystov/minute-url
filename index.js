const path = require("path");
const express = require("express");
const model_creator = require("./model");

const port = process.env.PORT || 8080;
const app = express();
const model = model_creator();

app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
    app.model = model;
    next();
});

app.get(/^\/new\/(.+)$/i, (req, res) => {
    var fullUrl = req.params[0];
    var queryString = req.originalUrl.match(/(\?.+$)/i);
    if(queryString != null) fullUrl += queryString[0];
    
    app.model.getKey(fullUrl, (err, key) => {
        if(err){
            console.log(err);
            res.send("Error getting a short url: " + err);
        }
        else{
            var baseUrl = req.protocol + '://' + req.get('host') + '/' + key;
            var newAddress = {
                original_url: fullUrl,
                short_url: baseUrl
            };
            res.send(JSON.stringify(newAddress));
        }
    });
});
app.get('/:key', (req, res) => {
    var key = Number(req.params.key);
    if(isNaN(key)){
        var rootUrl = req.protocol + '://' + req.get('host') + '/';
        res.send("The key you sent is not a number. Use " + rootUrl + "number key");
    }
    else{
        app.model.getUrl(key, (err, url) => {
            if(err){
                console.log(err);
                res.send("Error getting a full url by your key: " + err);
            }
            else{
                res.redirect(url);
            }
        });
    }
});

app.listen(port);