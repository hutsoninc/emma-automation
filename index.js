require('dotenv').config();
const Emma = require('emma-sdk');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

new Promise(function(resolve, reject){
        
    // Set up default mongoose connection
    var mongoDB = process.env.DB_LOCATION;

    mongoose.connect(mongoDB, function(err) {

        if(err) return console.error(err);

    });

    // Get the default connection
    var db = mongoose.connection;

    db.on('connected', function(ref){

        console.log('MongoDB connected');
        resolve();

    });

    db.on('error', function(err){

        reject(err);

    });

}).then(() => {

    const app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    // Configure application routes
    var routes = require('./app/router');
    var webhookRouter = express.Router();

    routes.webhookRoutes(webhookRouter);

    app.use(webhookRouter);

    var server = http.createServer(app);

    server.listen(process.env.PORT, process.env.HOST, () => {
        console.log("Express server running on port " + process.env.PORT);
    });

}), err => {
    
    if(err){
        console.log(err);
        process.exit();
    }

};
