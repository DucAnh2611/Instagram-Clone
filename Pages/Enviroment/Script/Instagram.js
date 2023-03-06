//lay data cho phan dissplay
async function UpdateFields() {
    let username_login = localStorage.getItem('usernameLogined');
    const respone = await fetch(`/home` , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined')
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelector(".avatar").src = data.userInfor.avatar_path;
        document.querySelector(".toProfile").href = `/${data.userInfor.username_user}`;

        document.querySelector(".avatarProfile").src = data.userInfor.avatar_path;
        document.querySelector(".IdUserLogin").innerText = data.userInfor.username_user;
        document.querySelector(".nameUserLogin").innerText = data.userInfor.fullname;

        var suggestListDisplay = document.querySelector(".suggestListDisplay");
        getMoreLine(suggestListDisplay.childElementCount, 6);

        suggestListDisplay.addEventListener("scroll", (event)=>{
            if(suggestListDisplay.offsetHeight + suggestListDisplay.scrollTop >=suggestListDisplay.scrollHeight) {
                getMoreLine(event.target.childElementCount, event.target.childElementCount + 5);
            }
        })
    })
    
};
UpdateFields();

async function postLoad() {
    let username_login = localStorage.getItem('usernameLogined');
    const respone = await fetch(`/home/getPostFollowing` , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username_login
        })
    })
    .then(res => res.json())
    .then((data) => {
        var postList = document.querySelector(".postList");
        data.forEach(async (post) => {
            var likedDisplay = "showbtn", unlikeDisplay = "showbtn";
            if(post.liked == 1){
                likedDisplay = "hidebtn";
                unlikeDisplay = "showbtn";
            }
            else {
                likedDisplay = "showbtn";
                unlikeDisplay = "hidebtn";
            }
            postList.innerHTML += `
            <div class="onePostInList">
                <div class="headerPost">
                    <div class="accountInfomation">
                        <div class="avatarInOnePostHolder">
                            <a class="avatarInOnePostClip" href="/${post.username_user}">
                                <img src="${post.avatar_path}" class="avatarInOnePost">
                            </a>
                        </div>
                        <div class="usernameAndDateCreated"> 
                            <a class="usernameInOnePost" href="/${post.username_user}">${post.username_user}</a>
                            <p class="dateCreatedInOnePost">${ new Date(post.postupdatedate).toLocaleString() }</p>
                        </div>
                    </div>
                </div>
                <div class="contentPost">
                    <div class="contentPostHolder"> 
                        <div class="blackBGInPost"> </div>
                        <img src="${post.photopath}" class="pictureInOnePost">                    
                    </div>

                </div>
                <div class="buttonReactHolder"> 
                    <button class="buttonReact like ${likedDisplay}">
                        <img src="/Pages/Enviroment/heart.png" class="iconButtonReact">
                    </button>
                    <button class="buttonReact liked ${unlikeDisplay}">
                        <img src="/Pages/Enviroment/heart_liked.png" class="iconButtonReact">
                    </button>
                    <button class="buttonReact comment">
                        <img src="/Pages/Enviroment/chat.png" class="iconButtonReact">
                    </button>
                </div>   
                <div class="postInformation">
                    <div class="countLikeOnePostHolder">
                        <p class="countLikeOnePost"> ${post.countlike} likes </p>
                    </div>
                    <div class="captionOfOnePost">
                        
                        <p class="captionInOnePost"><a href="/${post.username_user}" class="userUpPostInOnePost">${post.username_user}</a>${post.postcaption}</p>
                    </div>
                </div> 
                <div class="commentToPostholder">
                    <div class="ListCommentPost">
                        <button class="viewAllCommentPost">View all comment post</button>
                    </div>   
                    <div class="addCommentToPostHolder">
                        <span type="textarea" class="addCommentToPost" role="textbox" contenteditable></span>
                        <button class="postCommentPost">Post</button>
                    </div> 
                </div>
            </div>
            `;
        });
        var viewAllCommentPost = document.querySelectorAll(".viewAllCommentPost");
        viewAllCommentPost.forEach((buttonShow, index) =>{
            buttonShow.addEventListener("click", ()=>{
                updateComment(data[index], index);
            })
        })
        var postCommentPost = document.querySelectorAll(".postCommentPost");
        postCommentPost.forEach((buttonPost,index) => {
            buttonPost.addEventListener("click", () => {
                if(document.querySelectorAll(".addCommentToPost")[index].innerText != '') {
                    postCommentToPost(data[index], index);
                    socket.emit('noticePost', {
                        sender: localStorage.getItem('usernameLogined'), 
                        postid: data[index].postid, 
                        likeTime: new Date(),
                        type: 2
                    });
                }
            })
        })
        var likeBtn = document.querySelectorAll(".like");
        var unlikeBtn = document.querySelectorAll(".liked")
        likeBtn.forEach((buttonLike, index) => {
            buttonLike.addEventListener("click", ()=> {
                likePost(data[index], index);
                likeBtn[index].classList.remove("showbtn")
                likeBtn[index].classList.add("hidebtn");

                unlikeBtn[index].classList.remove("hidebtn")
                unlikeBtn[index].classList.add("showbtn");
                socket.emit('noticePost', {
                    sender: localStorage.getItem('usernameLogined'), 
                    postid: data[index].postid, 
                    likeTime: new Date(),
                    type:1
                });
            })
        })
        unlikeBtn.forEach((buttonUnLike, index) => {
            buttonUnLike.addEventListener("click", ()=> {
                unlikePost(data[index], index);
                likeBtn[index].classList.remove("hidebtn")
                likeBtn[index].classList.add("showbtn");

                unlikeBtn[index].classList.remove("showbtn")
                unlikeBtn[index].classList.add("hidebtn");
            })
        })
        var cmtBtn =document.querySelectorAll(".comment");
        cmtBtn.forEach((commentBtn, index) => {
            commentBtn.addEventListener("click", () => {
                document.querySelectorAll(".addCommentToPost")[index].focus();
                updateComment(data[index], index);
            })
        })
        document.querySelector(".lds-rollerHolder").style.visibility = "hidden";
    })
};
async function updateComment(comment, index){
    var ListCommentPost = document.querySelectorAll(".ListCommentPost");
    ListCommentPost[index].innerHTML=``;
    var getListCommentPost = await fetch(`/home/${comment.postid}/getCommentForPost`, {
        method: "GET"
    })
    .then(respone => respone.json())
    .then(commentList => {
        commentList.forEach( comment => {
            ListCommentPost[index].innerHTML += `
            <div class="aCommentPostHome">
                <div class="avatarUserCommentInforPostHolder">
                    <div class="avatarUserCommentInforPostClip"> 
                        <img src="${comment.avatar_path}" class="avatarUserCommentInforPost">
                    </div>
                </div> 
                <p class="aCommentPostLine"><a class="userCommentInforPost" href="/${comment.username_user}">${comment.username_user}</a>${comment.commentcontent}</p>
            </div>
            `;
        })
        var ListCommentPostScroll =document.querySelector(".ListCommentPost");
        ListCommentPostScroll.scrollTop = ListCommentPostScroll.scrollHeight;
    })
};
async function postCommentToPost(post, index){
    var postComment = await fetch(`/home/${post.postid}/postComment`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined'),
            commentText: document.querySelectorAll(".addCommentToPost")[index].innerText,
            commentTime: (new Date()).toUTCString(),
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelectorAll(".addCommentToPost")[index].innerText ="";
        document.querySelectorAll(".addCommentToPost")[index].focus();
        updateComment(post, index);
    });
};
async function likePost(post, index) {
    var postComment = await fetch(`/home/${post.postid}/likePost`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined')
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelectorAll(".countLikeOnePost")[index].innerHTML =`${data.countLikeLeft} likes`
    });
};
async function unlikePost(post, index) {
    var postComment = await fetch(`/home/${post.postid}/unlikePost`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined')
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelectorAll(".countLikeOnePost")[index].innerHTML =`${data.countLikeLeft} likes`
    });
};
async function getMoreLine(from, end) {
    let moreSuggest = localStorage.getItem('usernameLogined');
    const respone = await fetch(`/home/getMoreSuggestList` , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined'),
            from: from,
            end: end
        })
    })
    .then(res => res.json())
    .then((data) => {
        var listMore = Object(data.suggestFollow);
        if(Object.keys(listMore).length > 0) {
            Object.keys(listMore).map(keys => {
                createALineSuggest(listMore[keys])
             })
        }

    });
}
async function createALineSuggest(user) {
    var suggestListDisplay = document.querySelector(".suggestListDisplay");

    var aSuggestPerson = document.createElement("a");
    aSuggestPerson.className = "aSuggestPerson";
    aSuggestPerson.href = `/${user.username_user}`;
    aSuggestPerson.innerHTML = `
        <div class="avatarSuggestHolder">
            <div class="avatarSuggestClip">
                <img class="avatarSuggest" src="${user.avatar_path}">
            </div>
        </div>
        <div class="inforSuggestHolder">
            <p class="inforSuggestName"> ${user.username_user}</p>
            <p class="inforSuggestFullname">${user.fullname}</p>
        </div>
    `;
    suggestListDisplay.appendChild(aSuggestPerson);

}
var socket = io();
postLoad();
