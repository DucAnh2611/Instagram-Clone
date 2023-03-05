var socket = io();
async function updatePostInfor() {
    var getPostInfor = fetch(document.URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem("usernameLogined")
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        document.querySelector(".userOwnPostHolder").href = `/${data.ownerPost.username_user}`;
        document.querySelector(".usernameOwnPost").innerText = data.ownerPost.username_user;
        document.querySelector(".avatarUserOwnPost").src= data.ownerPost.avatar_path;
        document.querySelector(".pictureHolder").firstElementChild.src = data.postInfor.photopath;
        var commentOnPostHolder = document.querySelector(".commentOnPostHolder");
        Object.values(data.getAllCommentPost).forEach(comment => {
            commentOnPostHolder.innerHTML +=`
            <div class="oneLineCommentHolder">
                <a class="avatarUserCommentPostHolder" href="/${comment.username_user}">
                    <div class="avatarUserCommentPostClip">
                        <img src="${comment.avatar_path}" class="avatarUserCommentPost">

                    </div>
                </a>
                <div class="usernameCommentPostHolder">
                    <p class="usernameCommentPost"> <a href="/${comment.username_user}" class="usernameCommentPostPorfile">${comment.username_user}</a>${comment.commentcontent}</p>
                    <p class="commentDate"> ${(new Date(comment.commentdate)).toLocaleString()}</p>
                </div>
            </div>
            `;
        });
        document.querySelector(".countLikeOwnPost").innerText = data.postCountLike + " likes";
        document.querySelector(".date-time-post").innerText = (new Date(data.postInfor.postupdatedate)).toLocaleString();
        if(data.like) {
            document.querySelector(".like").style.display = "none";
        }else {
            document.querySelector(".liked").style.display = "none";
        }
        var likeBtn = document.querySelector(".like");
        var unlikeBtn = document.querySelector(".liked");
        var commentBtn =  document.querySelector(".postCommentPost");
        likeBtn.addEventListener("click", ()=>{
            likeBtn.style.display = "none";
            unlikeBtn.style.display = "block";
            likePost(data.postInfor.postid);
            socket.emit('noticePost', {
                sender: localStorage.getItem('usernameLogined'), 
                postid: data.postInfor.postid, 
                likeTime: new Date(),
                type:1
            });
        })
        unlikeBtn.addEventListener("click", () => {
            likeBtn.style.display = "block";
            unlikeBtn.style.display = "none";
            unlikePost(data.postInfor.postid);
        })
        commentBtn.addEventListener("click",()=>{
            commentPost(data.postInfor.postid, document.querySelector(".addCommentToPost").innerText, {
                usernameComment: localStorage.getItem("usernameLogined"),
                avaUsernameComment: document.querySelector(".avatar").src
            });
            
            document.querySelector(".addCommentToPost").innerText = "";
            document.querySelector(".addCommentToPost").focus();
            socket.emit('noticePost', {
                sender: localStorage.getItem('usernameLogined'), 
                postid: data.postInfor.postid, 
                likeTime: new Date(),
                type: 2
            });
        });
        document.querySelector(".lds-rollerHolder").style.visibility = "hidden";  
    })
}
updatePostInfor();
function likePost(postid) {
    var likePost = fetch(`/home/${postid}/likePost`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem("usernameLogined")
        })
    })
    .then(response => response.json())
    .then(data=>{
        document.querySelector(".countLikeOwnPost").innerText = `${data.countLikeLeft} likes`;
    })
}
function unlikePost(postid) {
    var likePost = fetch(`/home/${postid}/unlikePost`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem("usernameLogined")
        })
    })
    .then(response => response.json())
    .then(data=>{
        document.querySelector(".countLikeOwnPost").innerText = `${data.countLikeLeft} likes`;
    })
}
function commentPost(postid, content, userComment) {
    var nowDate = (new Date()).toUTCString();
    var likePost = fetch(`/home/${postid}/postComment`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem("usernameLogined"),
            commentText: content,
            commentTime: nowDate
        })
    })
    .then(response => response.json())
    .then(data=>{
        if(data.status == "ok") {
            var commentOnPostHolder = document.querySelector(".commentOnPostHolder");
            commentOnPostHolder.innerHTML +=`
            <div class="oneLineCommentHolder">
                <a class="avatarUserCommentPostHolder" href="/${userComment.usernameComment}">
                    <div class="avatarUserCommentPostClip">
                        <img src="${userComment.avaUsernameComment}" class="avatarUserCommentPost">

                    </div>
                </a>
                <div class="usernameCommentPostHolder">
                    <p class="usernameCommentPost"> <a href="/${userComment.usernameComment}" class="usernameCommentPostPorfile">${userComment.usernameComment}</a>${content}</p>
                    <p class="commentDate"> ${(new Date(nowDate)).toLocaleString()}</p>
                </div>
            </div>
            `;
        }
    })
}