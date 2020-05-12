import Dexie from 'dexie';

const db = new Dexie('IPNPDB');
db.version(1).stores({dictionaries: '[name+language]'});

export default db;
