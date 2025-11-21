const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Person = sequelize.define('Person', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    deathDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaData: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    timestamps: true
});

module.exports = Person;
