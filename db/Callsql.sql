-- select nhung nguoi ban ma minh follow
-- SELECT DISTINCT up2.userid
-- FROM user_profile AS up1 INNER JOIN follow AS fl ON up1.userid = fl.userid
--                          INNER JOIN user_profile AS up2 ON fl.followid = up2.userid
-- WHERE fl.userid = 1
-- select nhung nguoi cua ban minh follow
SELECT DISTINCT up2.username_user, up2.fullname, up2.avatar_path
FROM follow AS fl INNER JOIN user_profile AS up2 ON fl.followid = up2.userid
WHERE fl.userid IN (SELECT DISTINCT fl.followid
                    FROM user_profile AS up INNER JOIN follow AS fl ON up.userid = fl.userid
                    WHERE fl.userid = 9)
    AND fl.followid NOT IN (SELECT DISTINCT fl.followid
                    FROM user_profile AS up INNER JOIN follow AS fl ON up.userid = fl.userid
                    WHERE fl.userid = 9)
    AND fl.followid <> 9
OFFSET 6 ROWS
FETCH NEXT 100 ROWS ONLY