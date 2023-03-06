-- CREATE TABLE IF NOT EXISTS recentSearch (
-- 	userId int not null,
--     searchId int not null,
	
-- 	foreign key (userId) references User_Profile(userID),
-- 	foreign key (searchId) references User_Profile(userID)
-- );
-- ALTER TABLE recentSearch
-- ADD CONSTRAINT recentSearch_PK primary key (userId, searchId);
SELECT * from recentSearch