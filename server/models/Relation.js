const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Person = require('./Person');

const Relation = sequelize.define('Relation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('parent_child', 'partner'),
        allowNull: false
    },
    subType: {
        type: DataTypes.ENUM('biological', 'adopted', 'married', 'divorced', 'unmarried'),
        allowNull: true
    }
}, {
    timestamps: true
});

// Define associations
// We need to define who is who. 
// For parent_child: person1 is Parent, person2 is Child
// For partner: person1 and person2 are partners
Relation.belongsTo(Person, { as: 'person1', foreignKey: 'person1Id' });
Relation.belongsTo(Person, { as: 'person2', foreignKey: 'person2Id' });

module.exports = Relation;
