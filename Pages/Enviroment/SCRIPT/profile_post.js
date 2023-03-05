async function getPostList() {
    var pstList = await fetch(`${document.URL}/getListPost`, {
        method: "GET"
    })
    .then(response => response.json())
    .then(data =>{
        data.forEach((post, index) => {
            var postTabDisplay = document.querySelector(".postTabDisplay");
            postTabDisplay.innerHTML += `
                <a class="aPostDisplayProfile" href="/p/${post.postid}">
                    <img src="${post.photopath}" class="aPostPhotoProfile" style="width:100%;">
                    <div class="commentLikePostProfile" path="/post/">
                        <div class="commentPostProfile">
                            <img class="likeIconPostProfile" src="/Pages/Enviroment/like.png">
                            <p class="countLikeProfile">${post.countlike}</p>
                        </div>
                        <div class="likePostProfile">
                            <img class="commentIconPostProfile" src="Pages/Enviroment/comment.png">
                            <p class="countCommentProfile">${post.countcomment}</p>
                        </div>
                    </div> 
                </a>
                `;
        });
    })
    document.querySelector(".lds-rollerHolder").style.visibility = "hidden";  
}
getPostList();

