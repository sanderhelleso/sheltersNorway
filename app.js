// ES6
'use strict'

// vals
const express = require("express");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv').load();

// app
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;;
const host = process.env.HOST || 'localhost';

// view engine
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(`${__dirname}/public`));

// routes
app.get("/", (req, res) => {
    res.render("index");
});

// new shelter form
app.post("/form", (req, res) => {
    let formData = [];
    let getData = req.body.shelterData.split(",");
    getData.forEach(data => {
        formData.push(data);
    });

    // contact data
    let name = formData[0].split(": ")[1];
    let from = process.env.EMAIL_HOST;
    let to = process.env.EMAIL_HOST;
    let subject = "Innsendelse av tilfluktsrom";
    let message = "<h2>Nytt skjema sendt inn av: <b>" + name + "</b></h2><br><ul>";
    let count = 0;
    formData.forEach(data => {
        count++;
        // exclude name
        if (count > 1) {
            message += "<li><h3>" + data + "</h3></li>";
        }
    });
    message += "</ul>";

    // smpt setup
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            type: "login",
            user: process.env.EMAIL_HOST,
            pass: process.env.EMAIL_PASS
        }
    });

    // setup email data
    let mailOptions = {
        from: name + " - " + from + " <" + from + ">",
        to: to,
        subject: subject,
        html: message
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }

        // mail sendt
        console.log('Message sent: %s', info.messageId);
        return;
    });
});

// send dataset to client
app.get("/dataset", (req, res) => {
    fs.readFile("./dataset/shelters.json", "utf8", function (err, data) {
        if (err) throw err;
        res.send(data);
    });
});

// 	404
app.get("*", function(req, res){
  	res.render("index");
});

// start server
server.listen(port, host);
console.log(`Magic is happening on ${port}`);