const sequelize = require('../config/database');
const Person = require('./Person');
const Relation = require('./Relation');
const Media = require('./Media');

const db = {
    sequelize,
    Person,
    Relation,
    Media
};

module.exports = db;
