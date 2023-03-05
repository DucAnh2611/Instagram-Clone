DROP TABLE IF EXISTS noti;
DROP TABLE IF EXISTS likeOfPost;
DROP TABLE IF EXISTS commentOfPost;
DROP TABLE IF EXISTS photo;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS Follow;
DROP TABLE IF EXISTS message_like;
DROP TABLE IF EXISTS message_user;
DROP TABLE IF EXISTS User_Profile;

CREATE TABLE IF NOT EXISTS User_Profile (
	userID serial,
	username_user varchar(20) not null unique,
	password_user varchar(30) not null,
	email varchar(50),
	phone varchar(10),
	phoneActive bool,
	fullName varchar(50) not null,
	dateOfBirth timestamp with time zone,
	gender varchar(20),
	createDate timestamp with time zone not null,
	avatar_path varchar(500),
	bio varchar(150),
	activenow bool not null,
	lastActive timestamp with time zone not null,
	
	primary key (userID)
);

CREATE INDEX userIndex
ON User_Profile (userID);

CREATE TABLE IF NOT EXISTS message_user (
	messageId serial,
	senderId int not null,
	recieverId int not null,
	messageContent varchar(200) not null,
	messageSendTime timestamp with time zone not null,
	messageState bool not null,
	
	foreign key (senderId) references user_profile(userId),
	foreign key (recieverId) references user_profile(userId),
	primary key (messageId)
);

CREATE INDEX messageIndex 
ON message_user (messageId);

CREATE TABLE IF NOT EXISTS message_like (
	likeMessageId serial,
	messageId serial,
	likerId int not null,
	
	foreign key (likerId) references user_profile(userId),
	foreign key (messageId) references message_user(messageId),
	primary key (likeMessageId)
);
CREATE TABLE IF NOT EXISTS Follow (
	UserId int not null,
	followId int not null,
	
	foreign key (UserId) references user_profile(userId),
	foreign key (followId) references user_profile(userId)
);

ALTER TABLE Follow
ADD CONSTRAINT PK_Follow primary key (UserId, followId);

CREATE TABLE IF NOT EXISTS post (
	postID serial,
	userID int not null,
	postUpdateDate timestamp with time zone not null,
	postcaption varchar(200),
	
	primary key (postID),
	foreign key (userID) references User_Profile(userID)
);

CREATE TABLE IF NOT EXISTS photo (
	photoID serial,
	postID int not null,
	photoPath varchar(200) not null,
	
	primary key (photoID),
	foreign key (postID) references post(postID)
);

CREATE TABLE IF NOT EXISTS commentOfPost(
	commentID serial,
	postID int not null,
	userID int not null,
	commentContent varchar(200) not null,
	commentDate timestamp with time zone not null,
	
	primary key (commentID),
	foreign key (postID) references post(postID),
	foreign key (userID) references User_Profile(userID)
);
CREATE TABLE IF NOT EXISTS likeOfPost (
	likeID serial,
	postID int not null,
	userID int not null,
	
	primary key (likeID),
	foreign key (postID) references post(postID),
	foreign key (userID) references User_Profile(userID)
);
CREATE TABLE IF NOT EXISTS noti (
	notiId serial,
	userSendNotiID int not null,
	userRecNotiID int not null,
	stateNoti bool not null,
	noticeType int not null,
	noticeRecTime timestamp with time zone not null,
	descriptionNoti varchar(500),
	
	primary key (notiId),
	foreign key (userSendNotiID) references User_Profile(userID),
	foreign key (userRecNotiID) references User_Profile(userID)
)
