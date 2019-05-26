const boom = require('boom');

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
module.getSingleShelter = async(req, res) => {
    try {
        const id = req.params.id;
        const shelter = await Shelter.findById(id);
        return shelter;
    } catch(err) {
        throw boom.boomify(err);
    }
}