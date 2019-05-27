const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
    "_id": String,
    "lastUpdateCheck": Number,
    "coordinates": {
        lat: Number,
        lng: Number
    },
    "info": {
        "adresse": String,
        "gnr": Number,
        "bnr": Number,
        "kommunenr": Number,
        "areal": Number,
        "byggear": Number,
        "kategori": String,
        "kommune": String,
        "distriktsnavn": String,
        "plasser": Number,
        "romtype": String
    }
});

module.exports = mongoose.model('Shelter', shelterSchema);