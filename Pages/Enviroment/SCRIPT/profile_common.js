var socket = io();

var followBtn = document.querySelector(".followUser");
var unfollowBtn = document.querySelector(".unFollowUser");
var username_login = localStorage.getItem('usernameLogined');

async function UpdateFields() {

    //lay thong tin follow user hay chua de hien thi nut follow hay unfollow
    if(document.URL.split('/')[3] == username_login){
        document.querySelector(".messageUser").remove();
        document.querySelector(".followUser").remove();
        document.querySelector(".unFollowUser").remove();
    }else {
        document.querySelector(".messageUser").firstElementChild.href = `/message/to/${document.URL.split('/')[3]}`;
        document.querySelector(".editUser").remove();
        const followState = await fetch(document.URL + "/getFollowState" , {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usernameLogin: username_login
            })
        })
        .then(res => res.json())
        .then((data) => {
            if(data.status == 1) {
                followBtn.style.display = "none";
                unfollowBtn.style.display = "block";
            } 
            else {
                unfollowBtn.style.display = "none";
                followBtn.style.display = "block";
            }
        })
    }


    //hien thi thong tin cua user
    const respone = await fetch(document.URL , {
        method: "POST",
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelector(".userProfileUsernameText").innerText = data.username_user;
        document.querySelector(".userProfileAvatar").src = data.avatar_path;
        document.querySelector(".userProfileLineFullname").innerText = data.fullname;
        document.querySelector(".userProfileLineBio").innerText = data.bio;
        document.querySelector(".countPostUser").innerText = data.countPost;
        document.querySelector(".countFollowingUser").innerText=  data.countFollowing;
        document.querySelector(".countFollowedUser").innerText = data.countFollowed;
        document.title = `${data.fullname} (@${data.username_user}) - Instagram`;
    })
};
UpdateFields();

followBtn.addEventListener("click", async () =>{
    const addToFollowDB = await fetch(document.URL + "/addToFollowDB" , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usernameLogin: username_login,
            dateFollow: new Date()
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelector(".countFollowedUser").innerHTML = data.currentFollow;
        followBtn.style.display = "none";
        unfollowBtn.style.display = "block";
        socket.emit('noticeFollow', {
            senderId: data.senderNotiId,
            recieveId: data.recieveNotiId,
            dateNotice: data.dateFollow
        })
    })
})
unfollowBtn.addEventListener("click", async ()=>{
    const removeFromFollowDB = await fetch(document.URL + "/removeFromFollowDB" , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usernameLogin: username_login
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelector(".countFollowedUser").innerHTML = data.currentFollow;
        unfollowBtn.style.display = "none";
        followBtn.style.display = "block";
    })
})

//click vao follow, following
var FollowerShow = document.querySelector(".FollowerShow");
FollowerShow.addEventListener("click", () => {
    var path = "Followers", type = "Follow";
    popupFollow(path,type);
})
var FollowingShow = document.querySelector(".FollowingShow");
FollowingShow.addEventListener("click", () => {
    var path = "Following", type = "Following";
    popupFollow(path,type);
})
async function popupFollow(name, type) {
    var recieveUser = await fetch(`${document.URL}/get${type}`, {
        method: "GET"
    })
    .then(respone => respone.json())
    .then((data) => {
        showBG();
        document.querySelector(".popUp").classList.remove("hide");
        document.querySelector(".popUp").classList.add("show");
        document.querySelector(".textPopUp").innerText = name;

        var closePopUp = document.querySelector(".closePopUp");
        closePopUp.addEventListener("click", ()=>{
            hideBG();
            document.querySelector(".popUp").classList.remove("show");
            document.querySelector(".popUp").classList.add("hide");
        })
        
        var listInPathHolder = document.querySelector(".listInPathHolder");
        var displayAllUser = ``;
        data.forEach(user => {
            displayAllUser +=`
            <a class="userFollowPopUp" href="/${user.username_user}">
                <div class="avatarFollowPopUpHolder"> 
                    <div class="avatarFollowPopUpClip"> 
                        <img src="${user.avatar_path}" class="avatarFollowPopUp">
                    </div>
                </div>
                <div class="nameFollowPopUpHolder">
                    <p class="usernameFollowPopUp">${user.username_user}</p>
                    <p class="fullnameFollowPopUp">${user.fullname}</p>
                </div>
            </a>
            `;
        });
        listInPathHolder.innerHTML = displayAllUser;
    });
}
function showBG() {
    var blackBG = document.createElement("span");
    blackBG.className = "blackBG";
    document.body.appendChild(blackBG);
}
function hideBG() {
    if(document.querySelector(".blackBG")){
        document.querySelector(".blackBG").remove();
    }
}