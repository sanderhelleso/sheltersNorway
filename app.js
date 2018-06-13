const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const ejs = require("ejs");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 6500;

app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(`${__dirname}/public`));

// routes
app.get("/", (req, res) => {
	res.render("index");
});

// start server
server.listen(port, () => {
	console.log(`Magic is happening on ${port}`);
});