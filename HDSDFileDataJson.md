<h1 align="center">
  <br>
  Cách fill thông tin data.json
  <br>
</h1>
<p> Với mỗi user fill thông tin như sau:</p>

```bash
  "user1": {
    "userInfor": {
        "userid": 1,
        "username_user": "DucAnh",
        "password_user": "1",
        "email": "ducanh@gmail.com",
        "phone": "000000000",
        "phoneActive": false,
        "fullName": "DucAnh",
        "dateOfBirth": "2002-11-26T07:00:00+07:00",
        "gender": "Prefer not to say",
        "createDate": "2023-03-04T07:00:00+07:00",
        "avatar_path": "https://res.cloudinary.com/dxdmbosbl/image/upload/v1677747207/Instagram_Folder/default_ava_tp1inu.png",
        "bio": "",
        "activenow": false,
        "lastActive": "2023-03-05T07:00:00+07:00"
    }
  },
```
* Lưu ý 1: Nếu muốn thay đổi giờ thì không được thay đổi quá giờ hiện tại nếu muốn thay đổi thì làm như sau:
```bash
//Trước khi thay đổi:
"2002-11-26T07:00:00+07:00"

//sau khi thay đổi:
"2022-11-27T07:00:00+07:00"

//Thay đổi sai là: (Thêm dấu cách-space)
"2002-11-26 T 07:00:00+ 07:00"
```
* Lưu ý 2: bắt buộc các dòng phải có:
```bash
      "userid": sô, khác nhau theo từng user,
      "username_user": "",
      "password_user": "",
      "email": "NhapEmail@gmail.com",
      "phone": "000000000", //Phải đủ 10 số
      "phoneActive": false, //Điển true hoặc false
      "fullName": "",
      "dateOfBirth": "2002-11-26T07:00:00+07:00",
      "gender": "Prefer not to say",
      "createDate": "2023-03-04T07:00:00+07:00",
      "avatar_path": "https://res.cloudinary.com/dxdmbosbl/image/upload/v1677747207/Instagram_Folder/default_ava_tp1inu.png",
      "activenow": false,// Điển true hoặc false
      "lastActive": "2023-03-05T07:00:00+07:00"
``` 
* Lưu ý 3: Muốn thay đổi ảnh đại diện thì làm 1 folder mới là Avatar, up lên git, sau đó đổi tên với cú pháp:
```bash
tên ảnh: 'username_user'_avatar
ví dụ: username_user là admin1: admin1_avatar (Đổi tên ảnh nhé, còn link ở avatar_path thì để im đó)
còn nếu không muốn thay thì cứ để là: "https://res.cloudinary.com/dxdmbosbl/image/upload/v1677747207/Instagram_Folder/default_ava_tp1inu.png" ở phần avatar_path
``` 
