const fs = require("fs");
const express = require('express');
const router = express.Router();

// api version and prefix
const version = 1;
const base = `/api/v${version}/shelters`;

// controller
const sc = require('../controllers/shelterController');

module.exports = app => {

    // store data from dataset
    sc.seedShelters();

    // send dataset to client
    router.get("/dataset", (req, res) => {
        fs.readFile("./dataset/shelters.json", "utf8", (err, data) => {
            if (err) throw err;
            res.send(data);
        });
    });

    // get all shelters
    router.get('/all', (req, res) => {
        res.send(sc.getShelters(req, res));
    });

    // get single shelter by id
    router.get('/:id', (req, res) => {
        res.send(sc.getSingleShelter(req, res));
    });

    app.use(base, router);
}