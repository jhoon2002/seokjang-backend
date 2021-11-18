const path = require('path')
const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'production'
const config = require(
    path.join(__dirname + '/..', 'config', 'config.json')
)[env]
const db = {}
const sequelize = new Sequelize(
    config.database, config.username, config.password, config
)
db.sequelize = sequelize

db.pays = require('./pays.js')(sequelize, Sequelize)

module.exports = db
