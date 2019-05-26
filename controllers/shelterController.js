const boom = require('boom');
const request = require('request');

const publicDatasetURL = 'https://raw.githubusercontent.com/dsb-norge/static-share/master/shelters.json';
const Shelter = require('../models/Shelter');

// get all shelters
exports.getShelters = async(req, res) => {
    try {
        const shelters = await Shelter.find();
        return shelters;
    } catch(err) {
        throw boom.boomify(err);
    }
}

// get single shelter by ID
exports.getSingleShelter = async(req, res) => {
    try {
        const id = req.params.id;
        const shelter = await Shelter.findById(id);
        return shelter;
    } catch(err) {
        throw boom.boomify(err);
    }
}

// retrieves and stores all shelters from public dataset
exports.seedShelters = () => {
    request(publicDatasetURL, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            console.log(body);
        } else throw(err);
    })
}