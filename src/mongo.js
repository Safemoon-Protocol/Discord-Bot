const mongoose = require('mongoose');
const { mongoPath } = require('./config.json')

module.exports = async () => {
    await mongoose.connect(mongoPath, {
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return mongoose;
}