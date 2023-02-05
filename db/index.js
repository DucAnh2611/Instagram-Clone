const { Client } = require('pg');
const clientConnect = {
    host: "localhost",
    user: 'postgres',
    database: "Instagram_Project",
    password: '1',
    port: 5433
};

var createTable = async () => {
    let clientInsert = new Client(clientConnect);
    await clientInsert.connect();
    var selectAll = await clientInsert.query("");
    await clientInsert.end();   
}