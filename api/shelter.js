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
    router.get('/all', async (req, res) => {
        const result = await sc.getShelters(req, res);
        res.send(result);
    });

    // get single shelter by id
    router.get('/:id', async (req, res) => {
        const result = await sc.getSingleShelter(req, res);
        res.send(result);
    });

    // get shelters matching keywords
    router.get('/search/:keywords', async (req, res) => {
        const result = await sc.getMatchingShelters(req, res);
        res.send(result);
    });

    app.use(base, router);
}