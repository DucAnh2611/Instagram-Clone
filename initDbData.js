const { Client } = require('pg');
const clientConnect = {
    host: "localhost",
    user: 'postgres',
    database: "Instagram_Project",
    password: '1',
    port: 5433
};
const fs = require('fs');
let fileDataJson = fs.readFileSync('data.json');
let userList = JSON.parse(fileDataJson);
function insertUser(userList) {
    Object.keys(userList).map(async (user) => {
        var userInfor = userList[user].userInfor;
    
        var insertTableUser = new Client(clientConnect);
        await insertTableUser.connect();
        var insertUser = await insertTableUser.query(`
            INSERT INTO user_profile
            VALUES (${userInfor.userid}, '${userInfor.username_user}', '${userInfor.password_user}', '${userInfor.email}', '${userInfor.phone}', '${userInfor.phoneActive}', N'${userInfor.fullName}', '${userInfor.dateOfBirth}', '${userInfor.gender}', '${userInfor.createDate}', '${userInfor.avatar_path}', '${userInfor.bio}', '${userInfor.activenow}', '${userInfor.lastActive}')
        `);
        await insertTableUser.end();
        console.log(`insert ${userInfor.userid} succesful`);
    });
    // insertFollow(userList);
}
function insertFollow(userList) {
    Object.keys(userList).map(async (user) => {
        var userInfor = userList[user].userInfor;
        var userFollow = userList[user].follow;
    
        Object.keys(userFollow).map(async (follow) => {

            var insertFollowTable = new Client(clientConnect);
            await insertFollowTable.connect();
    
            var insertFollow = await insertFollowTable.query(`
                INSERT INTO follow
                VALUES (${userInfor.userid}, ${userFollow[follow]})
            `);
    
            await insertFollowTable.end();
            console.log(`follow ${userFollow[follow]} sucess`);
        });
    })
}
// insertUser(userList);
insertFollow(userList);