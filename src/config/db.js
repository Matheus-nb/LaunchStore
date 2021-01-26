const { Pool } = require('pg');


module.exports = new Pool({
    user: "matheus",
    password: "132546789",
    host: "localhost",
    port: 5432,
    database: "launchstoredb"
});