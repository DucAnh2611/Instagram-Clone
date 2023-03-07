const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const app = express();
const serverCreated = http.createServer(app);
const io = new Server(serverCreated);
// kho luu tru hinh anh
const cloudinary = require('cloudinary').v2;

//Tao login database
const dotenv = require('dotenv').config();
const { Client } = require('pg');
const clientConnect = {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
};
app.set('view engine', 'ejs');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true, limit: "20mb"}));
app.use(express.json({limit: "20mb"}));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname + '/Pages/login.html'));
});
//trang chu bai viet
app.get('/home',function(req,res) {
  res.sendFile(path.join(__dirname + '/Pages/instagram.html'));
});
app.post('/home', async function(request, response) {

  let clientUserLoad = new Client(clientConnect);
  await clientUserLoad.connect();

  var clientUser = await clientUserLoad.query(`
    SELECT username_user,fullname,avatar_path 
    FROM user_profile 
    WHERE username_user='${request.body.username}'
  `);
  await clientUserLoad.end();

  response.status(200).json( {userInfor: {...clientUser.rows[0]}} );
})
app.post('/home/getMoreSuggestList', async function(request, response) {

  let getMoreSuggestList = new Client(clientConnect);
  await getMoreSuggestList.connect();
  var userid = await getMoreSuggestList.query(`   
    SELECT userid 
    FROM user_profile 
    WHERE username_user = '${request.body.username}'
  `);
  var clientUser = await getMoreSuggestList.query(`
    SELECT username_user,fullname,avatar_path 
    FROM user_profile 
    WHERE username_user='${request.body.username}'
  `);
  var suggestUserFollow = await getMoreSuggestList.query(`
    SELECT DISTINCT up2.username_user, up2.fullname, up2.avatar_path
    FROM follow AS fl INNER JOIN user_profile AS up2 ON fl.followid = up2.userid
    WHERE fl.userid IN (SELECT DISTINCT fl.followid
                        FROM user_profile AS up INNER JOIN follow AS fl ON up.userid = fl.userid
                        WHERE fl.userid = ${userid.rows[0].userid})
        AND fl.followid NOT IN (SELECT DISTINCT fl.followid
                        FROM user_profile AS up INNER JOIN follow AS fl ON up.userid = fl.userid
                        WHERE fl.userid = ${userid.rows[0].userid})
        AND fl.followid <> ${userid.rows[0].userid}
    OFFSET ${request.body.from} ROWS
    FETCH NEXT ${request.body.end} ROWS ONLY
  `);
  await getMoreSuggestList.end();

  response.status(200).json({suggestFollow: {...suggestUserFollow.rows}});
})
app.post('/home/getPostFollowing', async function(request, response) {

  let getPostFollowing = new Client(clientConnect);
  await getPostFollowing.connect();
  var getUserId = await getPostFollowing.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.username}'`);
  var userId = getUserId.rows[0].userid;

  var listPostFollowing = await getPostFollowing.query(`
  SELECT ps.postId, up.username_user, up.fullname, up.avatar_path, postupdatedate, postcaption, photopath, (select count(*) from likeOfPost where postId = ps.postId) as countLike, (select count(*) from likeOfPost where (postId = ps.postId and userid = ${userId})) as liked
  FROM follow as fl INNER JOIN user_profile as up on fl.followId = up.userid
                    INNER JOIN post as ps on up.userid = ps.userid
                    INNER JOIN photo as pt on ps.postId = pt.postId
  WHERE fl.userid = ${userId}
  ORDER BY postupdatedate
  `);
  await getPostFollowing.end();

  response.status(200).json(listPostFollowing.rows);
});
app.get('/home/:postId/getCommentForPost', async function(request, response) {

  let getCommentForPost = new Client(clientConnect);
  await getCommentForPost.connect();

  var listPostComment = await getCommentForPost.query(`
  SELECT username_user, avatar_path, commentContent
  FROM commentOfPost AS cop INNER JOIN user_profile AS up on cop.userId = up.userId
  WHERE postId = ${request.params.postId}
  ORDER BY commentDate
  `);
  await getCommentForPost.end();

  response.status(200).json(listPostComment.rows);
});
app.post('/home/:postId/postComment', async function(request, response) {

  let postComment = new Client(clientConnect);
  await postComment.connect();
  var getUserId = await postComment.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.username}'`);
  var userId = getUserId.rows[0].userid;

  var insertComment = await postComment.query(`
  INSERT INTO commentOfPost 
  VALUES (DEFAULT, ${request.params.postId}, ${userId}, '${request.body.commentText}', '${request.body.commentTime}' )
  `);
  await postComment.end();

  response.status(200).json({status: "ok"});
});
app.post('/home/:postId/getLikedPost', async function(request, response) {

  let getLikedPost = new Client(clientConnect);
  await getLikedPost.connect();
  var getUserId = await getLikedPost.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.username}'`);
  var userId = getUserId.rows[0].userid;
  
  var likedPost = await getLikedPost.query(`
  SELECT *
  FROM likeOfPost
  WHERE userid =${userId} and postid = ${request.params.postId}
  `);
  await getLikedPost.end();
  var liked = false;
  if(likedPost.rows.length > 0) {
    liked= true
  }

  response.status(200).json({liked: liked});
});
app.post('/home/:postId/likePost', async function(request, response) {

  let likePost = new Client(clientConnect);
  await likePost.connect();
  var getUserId = await likePost.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.username}'`);
  var userId = getUserId.rows[0].userid;
  
  var unsertLike = await likePost.query(`INSERT INTO likeofpost VALUES (DEFAULT, ${request.params.postId}, ${userId})`);
  var countLikeLeft = await likePost.query(`SELECT count(*) FROM likeOfPost WHERE postId = ${request.params.postId}`)
  await likePost.end();

  response.status(200).json({countLikeLeft: countLikeLeft.rows[0].count});
});
app.post('/home/:postId/unlikePost', async function(request, response) {

  let unlikePost = new Client(clientConnect);
  await unlikePost.connect();
  var getUserId = await unlikePost.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.username}'`);
  var userId = getUserId.rows[0].userid;
  
  var unsertLike = await unlikePost.query(`DELETE FROM likeOfPost WHERE userId=${userId} AND postId=${request.params.postId}`);
  var countLikeLeft = await unlikePost.query(`SELECT count(*) FROM likeOfPost WHERE postId = ${request.params.postId}`)
  await unlikePost.end();

  response.status(200).json({countLikeLeft: countLikeLeft.rows[0].count});
});
// singlePost
app.get('/p/:postid',function(request, respone) {
  respone.sendFile(path.join(__dirname + '/Pages/profile_postLoad.html'));
})
app.post('/p/:postid',async function(request, respone) {
  var postInfor = new Client(clientConnect);
  await postInfor.connect();
  var getAllPostInfor = await postInfor.query(`SELECT * FROM post WHERE postid = ${request.params.postid}`);
  var getAllCountPost = await postInfor.query(`SELECT COUNT(*) FROM likeOfPost WHERE postid = ${request.params.postid}`);
  var getAllCommentPost = await postInfor.query(`
    SELECT commentcontent, username_user, avatar_path, commentdate, commentid
    FROM commentOfPost AS cp INNER JOIN user_profile AS up ON cp.userid = up.userid 
    WHERE postid = ${request.params.postid}
    ORDER BY commentdate
  `);
  var getAllInforOwnPost = await postInfor.query(`
    SELECT username_user, avatar_path 
    FROM post AS p INNER JOIN user_profile AS up ON p.userid = up.userid 
    WHERE postid = ${request.params.postid}
  `);
  var getPhotoPicPost = await postInfor.query(`SELECT photopath FROM photo WHERE postid = ${request.params.postid}`);
  var userReqId = await postInfor.query(`SELECT userid FROM user_profile WHERE username_user ='${request.body.username}'`);
  var likePost = await postInfor.query(`SELECT COUNT(*) FROM likeOfPost WHERE postid = ${request.params.postid} AND userid = ${userReqId.rows[0].userid} `)
  await postInfor.end()
  respone.status(200).json({
    postInfor: {...getAllPostInfor.rows[0], photopath: getPhotoPicPost.rows[0].photopath},  
    postCountLike: getAllCountPost.rows[0].count,
    getAllCommentPost: {...getAllCommentPost.rows},
    ownerPost: {...getAllInforOwnPost.rows[0]},
    like: (()=>{
      if(likePost.rows[0].count == 1) {
        return true;
      }else {
        return false;
      }
    })()
  })
})

//Trang nhan tin
app.get('/message',function(req,res) {
  res.sendFile(path.join(__dirname + '/Pages/message.html'));
});
app.post('/message/to/:username_rev',async function(request,response) {

  let userChat = new Client(clientConnect);
  await userChat.connect();
  var clientUser = await userChat.query(`SELECT username_user,fullname,avatar_path, activenow, lastactive FROM user_profile WHERE username_user='${request.params.username_rev}'`);
  await userChat.end();

  response.status(200).json(clientUser.rows[0])
});
app.get('/message/to/:username_rev',function(request,response) {
  response.sendFile(path.join(__dirname + '/Pages/chat.html'));
});

app.post('/message/to/:username_rev/getChat', async function(request,response) {
  let clientRetrieve = new Client(clientConnect);
  await clientRetrieve.connect();

  var selectAllMessage = await clientRetrieve.query(`
  SELECT up1.username_user as senderName, up1.avatar_path as senderAvatar, up2.username_user as recieverName,messageid, messageContent, messagesendtime, messageid, messagestate, (SELECT COUNT(*) FROM message_like WHERE messageid = mu.messageid) as count
  FROM (user_profile as up1 INNER JOIN message_user as mu ON up1.userid = mu.senderid INNER JOIN user_profile as up2 on mu.recieverid = up2.userid) 
  WHERE ( (up1.username_user='${request.body.username}' AND up2.username_user = '${request.params.username_rev}') OR (up1.username_user='${request.params.username_rev}' AND up2.username_user = '${request.body.username}') ) 
  ORDER BY messagesendtime`);

  await clientRetrieve.end();

  response.status(200).json(selectAllMessage.rows);
});
app.post('/message/to/:username_rev/sendMessage', async function(request,response) {
  let clientSendMessage = new Client(clientConnect);
  await clientSendMessage.connect();

  var maxIndexMessage = await clientSendMessage.query(`(SELECT COUNT(*) FROM message_user)`);
  var idSender = await clientSendMessage.query(`SELECT userid FROM user_profile WHERE (username_user = '${request.body.username}' )`);
  var idReciever = await clientSendMessage.query(`SELECT userid FROM user_profile WHERE (username_user = '${request.params.username_rev}' )`);
  var sendMessage = await clientSendMessage.query(`INSERT INTO message_user VALUES (DEFAULT, ${parseInt(idSender.rows[0].userid)}, ${parseInt(idReciever.rows[0].userid)}, '${request.body.message}', '${request.body.sendTime}', 'true')`);

  await clientSendMessage.end();

  response.status(200).json(sendMessage);
});
app.post('/message/to/:username_rev/listLikeMessage', async function(request,response) {
  var messageid = request.query.messageid;
  let listLikeMessage = new Client(clientConnect);
  await listLikeMessage.connect();
  
  var listLike = await listLikeMessage.query(`
  SELECT up.username_user AS username, up.avatar_path AS avatar_path, up.activenow AS isactive, up.lastactive AS lastactive
  FROM message_like AS ml INNER JOIN user_profile AS up ON ml.likerid = up.userid
  WHERE messageid = ${messageid}
  `);

  await listLikeMessage.end();

  response.status(200).json(listLike.rows);
});
app.post('/message/recentChat', async function(request,response) {
  let clientRetrieve = new Client(clientConnect);
  await clientRetrieve.connect();

  var selectAllMessage = await clientRetrieve.query(` SELECT DISTINCT up1.username_user as senderName, up1.avatar_path as senderAva, up1.fullname as senderFullname, up1.activenow as senderActive, up1.lastactive as senderLastActive, up2.username_user as recieverName, up2.avatar_path as recieverAva, up2.fullname as recieverFullname, up2.activenow as recieverActive, up2.lastactive as recieverLastActive FROM (user_profile as up1 INNER JOIN message_user as mu ON up1.userid = mu.senderid INNER JOIN user_profile as up2 on mu.recieverid = up2.userid) WHERE (up1.username_user='${request.body.username}' OR up2.username_user = '${request.body.username}') `);

  await clientRetrieve.end();

  response.status(200).json(selectAllMessage.rows);
});
//socket
io.on('connection', (socket) =>{
  socket.on('chat message', (messageSent) => {
    io.emit('chat message', messageSent);
  });
  socket.on('noticePost', async (info) =>{
    let likePost = new Client(clientConnect);
    await likePost.connect();
    var userGetNoTice = await likePost.query(`
      SELECT username_user as username_rec
      FROM post AS p INNER JOIN user_profile AS up on p.userId = up.userId
      WHERE postId = ${info.postid}
    `);
  
    var getSenderId = await likePost.query(`SELECT userID FROM user_profile WHERE username_user='${info.sender}'`);
    var SenderId = getSenderId.rows[0].userid;
  
    var getRecieverId = await likePost.query(`SELECT userID FROM user_profile WHERE username_user='${userGetNoTice.rows[0].username_rec}'`);
    var RecieverId = getRecieverId.rows[0].userid;
    
    var existLike = await likePost.query(`
      SELECT * 
      FROM noti
      WHERE usersendnotiid =${SenderId} AND userrecnotiid = ${RecieverId}
    `);
    var insertNoti = await likePost.query(`
      INSERT INTO noti
      VALUES (DEFAULT, ${SenderId}, ${RecieverId}, 'false', ${info.type}, '${(new Date(info.likeTime)).toUTCString()}', '/p/${info.postid}')
    `);
  await likePost.end();
  
    io.emit('noticePost', {
      ...userGetNoTice.rows[0],
      username_rec: userGetNoTice.rows[0].username_rec,
      username_send: info.sender,
      postid: info.postid,
      likeTime: (new Date(info.likeTime)).toUTCString()
    })
  });
  socket.on('noticeFollow',async (info) => {
    let followUser = new Client(clientConnect);
    await followUser.connect();
    var usernameSend = await followUser.query(`SELECT username_user FROM user_profile WHERE userid= ${info.senderId}`);
    var usernameRec = await followUser.query(`SELECT username_user FROM user_profile WHERE userid= ${info.recieveId}`)
    
    var insertFollowNoti = await followUser.query(`INSERT INTO noti VALUES (DEFAULT, ${info.senderId}, ${info.recieveId}, 'false', 3, '${(new Date(info.dateNotice)).toUTCString()}', '/${usernameSend.rows[0].username_user}')`)

    await followUser.end();

    io.emit('noticeFollow', {
      username_rec: usernameRec.rows[0].username_user
    })
  });
  socket.on('likeMessage', async (message) => {
    var likeMessage = new Client(clientConnect);
    await likeMessage.connect();
    var userLikeIdDb = await likeMessage.query(`SELECT userid FROM user_profile WHERE username_user = '${message.usernameLike}'`);
    var userLikeId = userLikeIdDb.rows[0].userid;
  
    var likeMessageCount = await likeMessage.query(`SELECT COUNT(*) FROM message_like WHERE (messageid = ${message.messageid} AND likerid = ${userLikeId})`);
    if(likeMessageCount.rows[0].count > 0){
      var insertLike = await likeMessage.query(`DELETE FROM message_like WHERE (messageid = ${message.messageid} AND likerid = ${userLikeId})`);
    }else {
      var insertLike = await likeMessage.query(`INSERT INTO message_like VALUES (DEFAULT, ${message.messageid}, ${userLikeId})`);
    }


    var countLikeMessage = await likeMessage.query(`SELECT COUNT(*) FROM message_like WHERE messageid = ${message.messageid}`);
    await likeMessage.end();
    io.emit('likeMessage', {
      countLike: countLikeMessage.rows[0].count,
      messageid: message.messageid
    })
  });
  socket.on('deleteMes', async (message)=>{
    var deleteMes = new Client(clientConnect);
    await deleteMes.connect();
    var unsend = await deleteMes.query(`UPDATE message_user SET messagestate = 'false' WHERE messageid = ${message.messageid}`)
    await deleteMes.end();
    io.emit('deleteMes', {
      messageid: message.messageid
    })
  });
  socket.on('loginAccount', async (user) =>{
    var loginAccount = new Client(clientConnect);
    await loginAccount.connect();
    var loginToAccount = await loginAccount.query(`UPDATE user_profile 
    SET activenow = 'true', lastActive='${(new Date()).toUTCString()}'
    WHERE username_user = '${user.username}' `);
    await loginAccount.end();
    io.emit('loginAccount', {
      username: user.username,
      state: "ok"
    })
  })
  socket.on('offlineAccount', async (user) =>{
    var loginAccount = new Client(clientConnect);
    await loginAccount.connect();
    var loginToAccount = await loginAccount.query(`UPDATE user_profile 
    SET activenow = 'false',  lastActive='${(new Date()).toUTCString()}'
    WHERE username_user = '${user.username}' `);
    await loginAccount.end();
    io.emit('offlineAccount', {
      username: user.username,
      state: "ok"
    })
  })
});

//Ho tro phan Tim kiem
app.post('/search', async function(request, respone){
  let clientUserLoad = new Client(clientConnect);
  await clientUserLoad.connect();
  var clientUser = await clientUserLoad.query(`SELECT username_user,fullname,avatar_path FROM user_profile WHERE (username_user LIKE '%${request.query.key}%' OR fullname LIKE '%${request.query.key}%') ORDER BY userID`);
  await clientUserLoad.end();

  respone.status(200).json(clientUser.rows);
})
app.post('/search', async function(request, respone){
  let clientUserLoad = new Client(clientConnect);
  await clientUserLoad.connect();
  var clientUser = await clientUserLoad.query(`SELECT username_user,fullname,avatar_path FROM user_profile WHERE (username_user LIKE '%${request.query.key}%' OR fullname LIKE '%${request.query.key}%') ORDER BY userID`);
  await clientUserLoad.end();

  respone.status(200).json(clientUser.rows);
})
app.post('/search/addRecentSearch', async function(request, respone){
  var usernameFind = request.query.username_find;
  var usernameReq = request.body.username;

  let addRecentSearch = new Client(clientConnect);
  await addRecentSearch.connect();

  var usernameFindId = await addRecentSearch.query(`SELECT userid FROM user_profile WHERE username_user='${usernameFind}'`);
  var usernameReqId = await addRecentSearch.query(`SELECT userid FROM user_profile WHERE username_user='${usernameReq}'`);
  var existsSearch = await addRecentSearch.query(`
    SELECT COUNT(*)
    FROM recentsearch
    WHERE userid = ${usernameReqId.rows[0].userid} AND searchid = ${usernameFindId.rows[0].userid}
  `);
  if(existsSearch.rows[0].count == 0) {
    var addRecent = await addRecentSearch.query(`
    INSERT INTO recentsearch
    VALUES (${usernameReqId.rows[0].userid}, ${usernameFindId.rows[0].userid})`);
  }

  await addRecentSearch.end();

  respone.status(200).json({status: "ok"});
})
app.post('/search/removeFromRecent', async function(request, respone){
  var usernameFind = request.query.username_find;
  var usernameReq = request.body.username;

  let removeFromRecent = new Client(clientConnect);
  await removeFromRecent.connect();

  var usernameFindId = await removeFromRecent.query(`SELECT userid FROM user_profile WHERE username_user='${usernameFind}'`);
  var usernameReqId = await removeFromRecent.query(`SELECT userid FROM user_profile WHERE username_user='${usernameReq}'`);

  var deletefromRecent = await removeFromRecent.query(`
     DELETE FROM recentsearch
     WHERE userid = ${usernameReqId.rows[0].userid} AND searchid = ${usernameFindId.rows[0].userid}
  `);

  await removeFromRecent.end();

  respone.status(200).json({status: "heello"});
})
app.post('/getAllRecent', async function(request, respone){

  let getAllRecent = new Client(clientConnect);
  await getAllRecent.connect();

  var usernameFindId = await getAllRecent.query(`
    SELECT up2.username_user, up2.avatar_path, up2.fullname 
    FROM user_profile AS up1 INNER JOIN recentsearch AS rcs ON up1.userid = rcs.userid
                             INNER JOIN user_profile AS up2 ON rcs.searchid = up2.userid
    WHERE up1.username_user = '${request.body.username}'
  `);

  await getAllRecent.end();

  respone.status(200).json(usernameFindId.rows);
})
var fixDate = (needFix) => {
  var newDate = (new Date(needFix)).toISOString().substring(0, 10);
  var newDay = String(parseInt(newDate[newDate.length-1]));
  return (new Date(needFix)).toUTCString();
}
//Trang thay doi thong tin nguoi dung
app.get('/edit',function (request, response) {
  response.sendFile(path.join(__dirname + '/Pages/profileDetail_Edit.html'));
});
app.post('/edit/changePic' , async function(request, response) {
  var srcNewPicSave = request.body.srcNewPicSave;
    var result = await cloudinary.uploader.upload(srcNewPicSave, {
      public_id: `${request.body.username}_avatar`,
      folder: "Instagram_Folder"
    });
    let clientUpdateUser = new Client(clientConnect);
    await clientUpdateUser.connect();
    var updateAvata = await clientUpdateUser.query(`UPDATE user_profile SET avatar_path='${result.secure_url}' WHERE (username_user='${request.body.username}')`);
    await clientUpdateUser.end();
    
    response.status(200).json({pathIMG: result.secure_url});
});
app.post('/edit/getDataUser' , async function(request, response) {

    var userInforFetch={
      username:"",
      email:"",
      phone:"",
      activephone: false,
      fullname:"",
      dateofbirth:"",
      gender:"",
      createdate:"",
      pathIMG: "",
      bio:""
    };

    
      let clientFetch = new Client(clientConnect);
      await clientFetch.connect();
      var selectAllInfo = await clientFetch.query(`SELECT * FROM user_profile WHERE username_user='${request.body.username}'`);
      await clientFetch.end();
      
      userInforFetch.username = selectAllInfo.rows[0].username_user;
      userInforFetch.email =selectAllInfo.rows[0].email
      userInforFetch.phone = selectAllInfo.rows[0].phone;
      userInforFetch.activephone = selectAllInfo.rows[0].activephone;
      userInforFetch.fullname = selectAllInfo.rows[0].fullname;
      userInforFetch.bio = selectAllInfo.rows[0].bio;
      userInforFetch.dateofbirth = fixDate(selectAllInfo.rows[0].dateofbirth);
      userInforFetch.gender = selectAllInfo.rows[0].gender;
      userInforFetch.createdate = fixDate(selectAllInfo.rows[0].createdate);
      userInforFetch.pathIMG = selectAllInfo.rows[0].avatar_path;
      
    response.status(200).json(userInforFetch);
});
app.post('/edit/activePhone' , async function(request, response) {
  var phonenum = request.query.phonenumber;
  var username = request.query.username;
  var activePhone = new Client(clientConnect);
  await activePhone.connect();
  var activePhonenumber = await activePhone.query(`UPDATE user_profile SET phone='${phonenum}', phoneActive='true' WHERE username_user = '${username}'`)
  await activePhone.end();
  response.status(200).json({status: "ok"});
});
app.post('/edit/checkPhone' , async function(request, response) {
  var username = request.query.username;
  var phonenum = request.query.phone;
  var checkPhone = new Client(clientConnect);
  await checkPhone.connect();
  var activePhonenumber = await checkPhone.query(`SELECT COUNT(*) FROM user_profile WHERE phone = '${phonenum}' AND username_user <> '${username}'`)
  await checkPhone.end();
  if(activePhonenumber.rows[0].count ==0) {
    response.status(200).json({status: "ok"});
  }
  else {response.status(200).json({status: "no ok"});}
});
app.post('/edit/checkMail' , async function(request, response) {
  var username = request.query.username;
  var email = request.query.mail;
  var checkMail = new Client(clientConnect);
  await checkMail.connect();
  var checkEmail = await checkMail.query(`SELECT COUNT(*) FROM user_profile WHERE email = '${email}' AND username_user <> '${username}'`)
  await checkMail.end();
  if(checkEmail.rows[0].count ==0) {
    response.status(200).json({status: "ok"});
  }
  else {response.status(200).json({status: "no ok"});}
});
app.post('/edit/authEdit',async function(request, respone) {
  var usernameBefore = request.body.beforeUsername;
  var publicIdLastPic = `${usernameBefore}_avatar`;
  var clientUser = new Client(clientConnect);
  await clientUser.connect();
  var getUserId = await clientUser.query(`
    SELECT userid
    FROM user_profile
    WHERE username_user = '${usernameBefore}'
  `);
  await clientUser.end();

  if(usernameBefore != request.body.username) {
    let clientAllusername = new Client(clientConnect);
    await clientAllusername.connect();
    var getAllUsername = await clientAllusername.query(`
      SELECT COUNT(*)
      FROM user_profile
      WHERE username_user = '${request.body.username}' AND userid <> '${getUserId.rows[0].userid}'
    `);
    await clientAllusername.end();
    var sameUsername = false;
    if(getAllUsername.rows[0].count > 0) sameUsername = true;

    if(!sameUsername) {
      var newPicOldPublicId  = await cloudinary.url(`Instagram_Folder/${publicIdLastPic}`);
      var newPicNewPublicId = await cloudinary.uploader.upload(newPicOldPublicId, {
        public_id: `${request.body.username}_avatar`,
        folder: "Instagram_Folder"
      });
      var destrouNewPicOldPublicId = await cloudinary.uploader.destroy(`Instagram_Folder/${publicIdLastPic}`);

      let clientUpdate = new Client(clientConnect);
      await clientUpdate.connect();
      var updateAvata = await clientUpdate.query(`UPDATE user_profile SET avatar_path='${newPicNewPublicId.secure_url}' WHERE (username_user='${usernameBefore}')`);
      await clientUpdate.end();

    }
    else{
       respone.status(200).json({status: "sameUsername"});
    }

  }
  var differentNumber = false;
  var checkMail = new Client(clientConnect);
  await checkMail.connect();
  var checkMailSame = await checkMail.query(`
    SELECT COUNT(*)
    FROM user_profile
    WHERE email = '${request.body.email}' AND userid <> '${getUserId.rows[0].userid}'
  `);
  var checkPhoneSame = await checkMail.query(`
    SELECT COUNT(*)
    FROM user_profile
    WHERE phone = '${request.body.phoneNumber}' AND userid <> '${getUserId.rows[0].userid}'
  `);
  var checkPhoneSameActive = await checkMail.query(`
    SELECT phone
    FROM user_profile
    WHERE userid = '${getUserId.rows[0].userid}'
  `)
  await checkMail.end();
  if(checkPhoneSameActive.rows[0].phone != request.body.phoneNumber){
    differentNumber = true;
  }

  if(checkMailSame.rows[0].count > 0) {
    respone.status(200).json({status: "sameEmail"});
  }
  else if(checkPhoneSame.rows[0].count > 0) {
    respone.status(200).json({status: "samePhone"});
  }else {
    let clientUpdateUser = new Client(clientConnect);
    await clientUpdateUser.connect();
    var updateUser = await clientUpdateUser.query(`UPDATE user_profile SET username_user='${request.body.username}', email='${request.body.email}', phone='${request.body.phoneNumber}', dateOfBirth='${(new Date(request.body.dateOfBirth)).toUTCString()}', gender='${request.body.gender}', fullname= N'${request.body.fullname}', bio=N'${request.body.bio}' WHERE (username_user='${usernameBefore}')`); 
    if(differentNumber) {
      var updateActiveNumber = await clientUpdateUser.query(`UPDATE user_profile SET phoneactive = 'false' WHERE (username_user='${request.body.username}')`); 
    }
    await clientUpdateUser.end();
    respone.status(200).json({status: "ok", newUsernameLogined: request.body.username })
  }
})

//Trang thay doi mat khau
app.get('/change-password', function(request, response) {
  response.sendFile(path.join(__dirname + '/Pages/profileDetail_ChangePassword.html'));
});
app.post('/change-password', async function(request, response) {
  let selectUser = new Client(clientConnect);
  await selectUser.connect();
  var resultSelect = await selectUser.query(`SELECT username_user, avatar_path FROM user_profile WHERE (username_user='${request.body.username}')`);
  await selectUser.end();

  response.status(200).json(resultSelect.rows[0])
});
app.post('/change-password/authChange',async function(request, respone) {

  let selectUser = new Client(clientConnect);
  await selectUser.connect();
  var resultSelect = await selectUser.query(`SELECT password_user FROM user_profile WHERE (username_user='${request.body.username}')`);
  await selectUser.end();

  var oldPasswordRight = resultSelect.rows[0].password_user;
  if(String(request.body.old_pass) == String(oldPasswordRight)){
    if(String(request.body.confirm_pass) == String(request.body.new_pass)  && String(request.body.old_pass) != String(request.body.new_pass)){
      //truong hop dung duy nhat
      let clientUpdateUser = new Client(clientConnect);
      await clientUpdateUser.connect();
      var updateAvata = await clientUpdateUser.query(`UPDATE user_profile SET password_user='${request.body.confirm_pass}' WHERE (username_user='${request.body.username}')`);
      await clientUpdateUser.end();

      respone.status(200).json({changed: "done"})
    }
    else if(String(request.body.confirm_pass) == String(request.body.new_pass)  && String(request.body.old_pass) == String(request.body.new_pass)){
      respone.status(200).json({changed: "odlNewSame"})
    }
    else if(String(request.body.confirm_pass) != String(request.body.new_pass)) {
      respone.status(200).json({changed: "newConfirmWrong"})
    }
  }
  else {
    respone.status(200).json({changed: "oldPassWrong"})
  }
  respone.send(request.body);

})

//Nhan thong tin khi an Login
var statusFailed = 0;
app.post('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/Pages/login.html'));
})
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/Pages/login.html'));
});

app.post('/auth', function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if(username && password) {
    var asyncFunc = async () =>{
      let clientInsert = new Client(clientConnect);
      await clientInsert.connect();
      var selectUser = await clientInsert.query("SELECT * FROM user_profile WHERE username_user='" + username + "'");
      await clientInsert.end();

      if (selectUser.rows.length >0 ) {
        if(selectUser.rows[0].password_user != password) {
          response.status(200).json({status: 0})
        }
        else {
          response.status(200).json({status: 1, username: username})
        }
      }else {
        response.status(200).json({status: 2})
      }
      response.end();

    }
  }
  asyncFunc();
});

//kiem tra xem input la email hay phone
function returnMailOrPhoneNumber(dataNotFilter) {
  if(dataNotFilter.includes(" ")) {
    return 0;
  } else {
    var emmailForm = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    if(emmailForm.test(dataNotFilter)) {
      return 1;
    }else {
      var phoneno = /^\d{10}$/;
      if(phoneno.test(dataNotFilter)) {
        return 2;
      }
      else {
          return 0;
      }
    }
  }
}

// phan Dang ky
var statusSignUp =0;
app.get('/signup', function(request, response){
  response.sendFile(path.join(__dirname + '/Pages/signup.html'));
})
app.post('/signup' ,function(request, response){
  response.sendFile(path.join(__dirname + '/Pages/signup.html'));
})
app.post('/singupInfo', function(request, response) {
  var emailOrPhone = request.body.emailOrPhone;
  var fullname = request.body.fullname;
  var username = request.body.username;
  var password = request.body.password;
  
  if(username && password && emailOrPhone && fullname) {
    var asyncFunc = async () =>{

      let clientSelect = new Client(clientConnect);
      await clientSelect.connect();
      var selectEmail = await clientSelect.query(`SELECT * FROM user_profile WHERE (email='${emailOrPhone}' OR phone='${emailOrPhone}')`);
      var selectUsername = await clientSelect.query(`SELECT * FROM user_profile WHERE username_user='${username}'`);
      await clientSelect.end();

      if(selectUsername.rows.length > 0 || selectEmail.rows.length > 0) {
        if(selectUsername.rowCount > 0 && selectEmail.rowCount == 0) {
          statusSignUp = 1;
        }
        if(selectEmail.rowCount > 0 && selectUsername.rowCount == 0) {
          statusSignUp = 2;
        }
        if(selectEmail.rowCount >0 && selectUsername.rowCount > 0) {
          statusSignUp = 3;
        }
      }
      else {
        statusSignUp = 5;
        let clientInsertUser = new Client(clientConnect);
        await clientInsertUser.connect();
        var emailUser = "";
        var phoneUser = "";
        var activePhone = false;

        var pathDefault = "https://res.cloudinary.com/dxdmbosbl/image/upload/v1677747207/Instagram_Folder/default_ava_tp1inu.png";
        var uploadDefaultPic= await cloudinary.uploader.upload(pathDefault, {
          public_id: `${username}_avatar`,
          folder: "Instagram_Folder"
        }, err => {if (err) throw err});
        switch(returnMailOrPhoneNumber(emailOrPhone)) {
          case 1:
            emailUser = emailOrPhone;
            break;
          case 2:
            phoneUser = emailOrPhone;
            break;
          case 0:
            statusSignUp = 4;
          default:
            break;
        }
        if(statusSignUp == 5){
          var insertUser = await clientInsertUser.query(`INSERT INTO user_profile VALUES ( DEFAULT, '${username}', '${password}', '${emailUser}', '${phoneUser}', ${activePhone}, N'${fullname}', '${(new Date()).toUTCString()}', 'Prefer not to say', '${(new Date()).toUTCString()}', '${uploadDefaultPic.secure_url}', '', 'true', '${(new Date()).toUTCString()}' )`);
          await clientInsertUser.end();
        }
       
      }
      response.status(200).json({status: statusSignUp})
      response.end();

    }
  }
  asyncFunc();
});
//comming soon
app.get('/commingSoon', function(request, response) {
  response.sendFile(path.join(__dirname + '/Pages/comming.html'))
})
//get post
app.post('/userPost', async function(request, response) {
  let userPost = new Client(clientConnect);
  await userPost.connect();

  var getUserId = await userPost.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.username}'`);
  var userId = getUserId.rows[0].userid;

  var insertPostToDb = await userPost.query(`
  INSERT INTO post 
  VALUES (DEFAULT, ${userId}, '${request.body.dateCreate}', '${request.body.postCaption}')
  `);

  
  var result = await cloudinary.uploader.upload(request.body.imgPostUrl, {
    folder: "postPhoto"
  });

  var insertphotoToDb = await userPost.query(`
  INSERT INTO photo
  VALUES (DEFAULT,  (SELECT MAX(postId) FROM post), '${result.secure_url}')
  `);

  await userPost.end();
  response.status(200).json({status: "ok", urlImg: result.secure_url});
})
//notification
app.post('/notification/getFull', async function(request, response) {
  let getFull = new Client(clientConnect);
  await getFull.connect();

  var getUserId = await getFull.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.username}'`);
  var userId = getUserId.rows[0].userid;

  var getfullNoti = await getFull.query(`
    SELECT noti.*, up.avatar_path as sender_ava, username_user as username_sender
    FROM noti INNER JOIN user_profile as up on noti.usersendnotiid = up.userid
    WHERE userrecnotiid='${userId}' 
    ORDER BY noticerectime DESC
  `);

  await getFull.end();

  response.status(200).json(getfullNoti.rows)
})
app.post(`/notification/changeNoti`, async function(request, respone) {
  var notiid = request.query.notiid;
  var changeNoti = new Client(clientConnect);
  await changeNoti.connect();
  var changeNotiStatus = await changeNoti.query(`UPDATE noti SET statenoti = 'true' WHERE notiid = ${notiid}`)
  await changeNoti.end();

  respone.status(200).json({status: "ok"});
})
//profile_post
app.get('/:username', function(request, response) {
  response.sendFile(path.join(__dirname + '/Pages/profile_post.html'))
})
app.post('/:username', async function(request, response) {
  let profilePostUser = new Client(clientConnect);
  await profilePostUser.connect();

  var getProfilePostUser = await profilePostUser.query(`SELECT username_user,fullname,avatar_path,bio FROM user_profile WHERE username_user='${request.params.username}'`);

  var getUserId = await profilePostUser.query(`SELECT userID FROM user_profile WHERE username_user='${request.params.username}'`);
  var userId = getUserId.rows[0].userid;

  var getCountPost = await profilePostUser.query(`SELECT * FROM post WHERE userID='${userId}'`);
  var getCountFollowing = await profilePostUser.query(`SELECT * FROM Follow WHERE userID='${userId}'`);
  var getCountFollowed = await profilePostUser.query(`SELECT * FROM Follow WHERE followID='${userId}'`);

  await profilePostUser.end();

  response.status(200).json({...getProfilePostUser.rows[0],countPost: getCountPost.rowCount,countFollowing: getCountFollowing.rowCount,countFollowed: getCountFollowed.rowCount})
})
app.get('/:username/getListPost', async function(request, response) {
  let getListPost = new Client(clientConnect);
  await getListPost.connect();

  var getUserId = await getListPost.query(`SELECT userID FROM user_profile WHERE username_user='${request.params.username}'`);
  var userId = getUserId.rows[0].userid;

  var listPost = await getListPost.query(`
      SELECT photopath, ps.postId, (select count(*) from likeOfPost where postId = ps.postid) as countLike, (select count(*) from commentOfPost where postId = ps.postid) as countComment
      FROM photo AS pt INNER JOIN post AS ps on pt.postId = ps.postId
      WHERE userId = ${userId}
    `);
  await getListPost.end();
  response.status(200).json(listPost.rows);
})

app.post('/:username/getFollowState', async function(request, response) {
  let getFollowState = new Client(clientConnect);
  await getFollowState.connect();

  var getUserId = await getFollowState.query(`SELECT userID FROM user_profile WHERE username_user='${request.params.username}'`);
  var userId = getUserId.rows[0].userid;

  var getUserLoginId = await getFollowState.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.usernameLogin}'`);
  var userLoginId = getUserLoginId.rows[0].userid;

  var getCountFollowing = await getFollowState.query(`SELECT * FROM Follow WHERE (userID='${userLoginId}' AND followID='${userId}')`);
  await getFollowState.end();

  response.status(200).json( (() => {
    if(getCountFollowing.rowCount) return {status: 1}
    else return {status: 0}
  })() 
  );
})

app.post('/:username/addToFollowDB', async function(request, response) {
  let addToFollowDB = new Client(clientConnect);
  await addToFollowDB.connect();

  var getUserId = await addToFollowDB.query(`SELECT userID FROM user_profile WHERE username_user='${request.params.username}'`);
  var userId = getUserId.rows[0].userid;

  var getUserLoginId = await addToFollowDB.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.usernameLogin}'`);
  var userLoginId = getUserLoginId.rows[0].userid;

  var insertFollow = await addToFollowDB.query(`INSERT INTO follow VALUES (${userLoginId}, ${userId})`);
  var getCountFollowed = await addToFollowDB.query(`SELECT * FROM follow WHERE followID='${userId}'`);

  await addToFollowDB.end();

  response.status(200).json({currentFollow: getCountFollowed.rowCount, senderNotiId: userLoginId, recieveNotiId: userId, dateFollow: request.body.dateFollow})
})

app.post('/:username/removeFromFollowDB', async function(request, response) {
  let removeFromFollowDB = new Client(clientConnect);
  await removeFromFollowDB.connect();
  var getUserId = await removeFromFollowDB.query(`SELECT userID FROM user_profile WHERE username_user='${request.params.username}'`);
  var userId = getUserId.rows[0].userid;

  var getUserLoginId = await removeFromFollowDB.query(`SELECT userID FROM user_profile WHERE username_user='${request.body.usernameLogin}'`);
  var userLoginId = getUserLoginId.rows[0].userid;

  var removeFollow = await removeFromFollowDB.query(`DELETE FROM follow WHERE userID = ${userLoginId} AND followID = ${userId}`);
  var getCountFollowed = await removeFromFollowDB.query(`SELECT * FROM follow WHERE followID='${userId}'`);
  await removeFromFollowDB.end();

  response.status(200).json({currentFollow: getCountFollowed.rowCount})
})

app.get('/:username/getFollow', async function(request, response) {
  let getFollow = new Client(clientConnect);
  await getFollow.connect();

  var getUserId = await getFollow.query(`SELECT userID FROM user_profile WHERE username_user='${request.params.username}'`);
  var userId = getUserId.rows[0].userid;

  var GetAllUserFollow = await getFollow.query(`
  SELECT username_user, fullname, avatar_path 
  FROM follow as fl INNER JOIN user_profile as up on fl.userID = up.userID
  WHERE followID = ${userId}
  `);
  await getFollow.end();

  response.status(200).json(GetAllUserFollow.rows)
})
app.get('/:username/getFollowing', async function(request, response) {
  let getFollow = new Client(clientConnect);
  await getFollow.connect();

  var getUserId = await getFollow.query(`SELECT userID FROM user_profile WHERE username_user='${request.params.username}'`);
  var userId = getUserId.rows[0].userid;

  var GetAllUserFollowing = await getFollow.query(`
  SELECT username_user, fullname, avatar_path 
  FROM follow as fl INNER JOIN user_profile as up on fl.followID = up.userID
  WHERE fl.userID = ${userId}
  `);
  await getFollow.end();

  response.status(200).json(GetAllUserFollowing.rows)
})
//khoi chay server
const server = serverCreated.listen(7000, () => {
  console.log(`Express running → PORT http://localhost:${server.address().port}`);
});
