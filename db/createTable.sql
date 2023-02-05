DROP TABLE IF EXISTS post_comment;
DROP TABLE IF EXISTS commentofpost;
DROP TABLE IF EXISTS post_photo;
DROP TABLE IF EXISTS photo;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS user_profile;

CREATE TABLE IF NOT EXISTS User_Profile (
	userID int not null unique,
	username_user varchar(20) not null unique,
	password_user varchar(30) not null,
	emailOrPhone varchar(50),
	fullName varchar(30) not null,
	dateOfBirth date,
	gender varchar(20),
	createDate date not null,
	
	primary key (userID)
);

CREATE TABLE IF NOT EXISTS post (
	postID int not null unique,
	userID int not null,
	postUpdateDate date not null,
	postcaption varchar(200),
	
	primary key (postID),
	foreign key (userID) references User_Profile(userID)
);

CREATE TABLE IF NOT EXISTS photo (
	photoID int not null unique,
	photoPath varchar(200) not null,
	
	primary key (photoID)
);

CREATE TABLE IF NOT EXISTS post_photo (
	postID int not null,
	photoID int not null,
	
	foreign key (postID) references post(postID),
	foreign key (photoID) references photo(photoID)
);

ALTER TABLE post_photo
ADD CONSTRAINT PK_post_photo primary key (postID, photoID);

CREATE TABLE IF NOT EXISTS commentOfPost (
	commentID int not null unique,
	commentContent varchar(200) not null,
	
	primary key (commentID)
);

CREATE TABLE IF NOT EXISTS post_comment (
	postID int not null,
	commentID int not null,
	
	foreign key (postID) references post(postID),
	foreign key (commentID) references commentOfPost(commentID)
);

ALTER TABLE post_comment
ADD CONSTRAINT PK_post_comment primary key (postID, commentID)
