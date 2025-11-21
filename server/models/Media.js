const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Person = require('./Person');

const Media = sequelize.define('Media', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('document', 'photo'),
        allowNull: false,
        defaultValue: 'photo'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

Media.belongsTo(Person, { foreignKey: 'personId' });
Person.hasMany(Media, { foreignKey: 'personId' });

module.exports = Media;
