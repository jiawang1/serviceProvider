// const Pouch = require('pouchdb');

var db = null;

exports.initDB = (name) => {
    try {
        if (db !== null) {
            return db.close().then(() => {
                return db = new Pouch(name);
            }).then(db => {
                return db.info();
            }).then(info => {
                console.log(`==== init database === : ${info}`);
                return db;
            });
        } else {
            db = new Pouch(name);
            return db.info().then(info => {
                console.log(`==== init database === : ${info}`);
                return db;
            });
        }
    } catch (err) {
        return Promise.reject(err);
    }
};
exports.loadServiceData = (path, rootKey) => {
    return db.get({
        _id: path
    }).then(doc => {
        return doc[rootKey];
    }).catch(err => {
        console.error(err.stack || err);
        return err;
    });
};
