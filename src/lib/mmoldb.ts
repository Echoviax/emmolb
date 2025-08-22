import postgres from "postgres";

const sql = postgres({
    host: 'mmoldb.beiju.me',
    port: 42416,
    database: 'mmoldb',
    username: 'guest',
    password: process.env.MMOLDB_PASSWORD,
});

export default sql;