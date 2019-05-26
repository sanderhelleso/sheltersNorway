const boom = require('boom');
const request = require('request');
const fs = require('fs');
const Shelter = require('../models/Shelter');

const localeDataset = './dataset/shelters.json';
const publicDatasetURL = 'https://raw.githubusercontent.com/dsb-norge/static-share/master/shelters.json';
const fetchInterval = 8640000; // 24h

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

// get matching shelters, matching keywords
exports.getMatchingShelters = async(req, res) => {
    try {
        const keywords = req.params.keywords.trim();
        const kwRegex = new RegExp(`${keywords}`, 'i')
        const shelters = await Shelter.find({ 
            $or: [ 
                { 'info.adresse': kwRegex },
                { 'info.kommune': kwRegex },
                { 'info.distriktsnavn': kwRegex }
            ]
        });

        return shelters;
    } catch(err) {
        throw boom.boomify(err);
    }
}

// scan dataset at sat interval
exports.seedShelters = () => {

    // load on server start
    updateDataset();

    // then every 24h after
    setInterval(() => {
        updateDataset();
    }, fetchInterval)
}

// retrieves and stores all shelters from public dataset
function updateDataset() {
    console.log(`Scanning dataset at: ${new Date().toUTCString()}`);
    request(publicDatasetURL, (err, res, body) => {

         /**
            *  The following code attempts to create new shelter 
            *  if there previously did not exist one since last  dataset scan.
            * 
            *  The id of the shelter is unique and in a case where the shelter
            *  already is saved, we attempt to update in a case of dataset modification
            *  such that we will at any time have the most up-to-date data available
        */

        if (!err && res.statusCode === 200) {
            body = JSON.parse(body);
            if (body.hasOwnProperty('features')) {
                body.features.forEach(async shelter => {

                    // we use the shelters main adress as PK
                    const id = shelter.properties.adresse;
                    const s = { 
                        '_id': id,
                        'lastUpdateCheck': new Date().getTime()
                    };

                    // update to match schema
                    const coords = shelter.geometry.coordinates;
                    s.coordinates = { lat: coords[0], lng: coords[1] };
                    s.info = shelter.properties;

                    const newShelter = new Shelter(s);

                    try { 
                        await newShelter.save();
                    } catch(err) {
                        await Shelter.findByIdAndUpdate(id, newShelter, { new: true })
                    }
                });

                // store dataset locally for offline
                /*fs.writeFile(localeDataset, body, 'utf8', (err) => {
                    if (err) throw err;
                    console.log(`Dataset updated at: ${new Date().toUTCString()}`);
                });*/
            }
        }
    })
}