const pgPromise = require('pg-promise')
const promise = require('bluebird')

const createConn = (databaseUrl) => {
    const initOptions = {
      promiseLib: promise,
      error(error, e) {
        console.error(e.query);
        error.query = e.query;
        error.DB_ERROR = true;
        return { ...error, DB_ERROR: true };
      }
    };
  
    const pgp = pgPromise(initOptions);
    const db = pgp(databaseUrl);
  
    return { db, pgp };
  };
  
const db = createConn('postgres://cm:cm@localhost:5432/cmdb');

module.exports = db