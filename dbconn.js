// connect to monngodb
const mongoose = require('mongoose');

module.exports = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log('MongoDB connected…'))
        .catch(err => console.log(err))
}