function createPopupPost() {
    createDefaultPage();
        
    var createPostDivCloseBtn = document.querySelector(".createPostDivCloseBtn");
    createPostDivCloseBtn.addEventListener("click", ()=>{
        document.querySelector(".createPostDiv").remove();
        hideBG();
    })
    var createPostDivBackBtn = document.querySelector(".createPostDivBackBtn");
    createPostDivBackBtn.addEventListener("click", ()=>{
        document.querySelector(".createPostDiv").remove();
        createPopupPost();
    })
    var createPostPagesPics = document.querySelector(".createPostPagesPics");
    createPostPagesPics.addEventListener("input", event => {
        console.log(event.target.files[0])
        createPostPicCaptionPage(event.target.files[0]);

        var createPostDivCloseBtn = document.querySelector(".createPostDivCloseBtn");
        createPostDivCloseBtn.classList.remove("show");
        createPostDivCloseBtn.classList.add("hide");
        document.querySelector(".createPostDivBackBtn").classList.remove("hide");
        document.querySelector(".createPostDivBackBtn").classList.add("show");
        var createPostDivShareBtn = document.querySelector(".createPostDivShareBtn");
        createPostDivShareBtn.classList.remove("hide");
        createPostDivShareBtn.classList.add("show");

        createPostDivShareBtn.addEventListener("click", async () => {
            var datePost = new Date;
            var fetchPostToDb = await fetch(`/userPost`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: localStorage.getItem('usernameLogined'),
                    postCaption: document.querySelector(".captionCreatePostText").value,
                    dateCreate: datePost.toISOString(),
                    imgPostUrl: document.querySelector(".createPostDivPicsCaption").src,

                })
            })
            .then(res => res.json())
            .then((data) => {
                if(data.status == "ok"){
                    document.querySelector(".createPostDiv").remove();
                    alert("sucessfull");
                    window.location.reload();
                }
            });
        })
    })
    
}

function createDefaultPage() {
    var createPostDiv = document.createElement("div");
    createPostDiv.className = "createPostDiv";
    document.body.appendChild(createPostDiv);
    var innerCreatePostDiv = `
        <div class="createPostDivTitleHolder">
            <p class="createPostDivTitle">Create new post</p>
            <img src="/Pages/Enviroment/close.png" class="createPostDivCloseBtn show">
            <img src="/Pages/Enviroment/back.png" class="createPostDivBackBtn hide">
            <button class="createPostDivShareBtn hide">Share</button>
        </div>
        <div class="createPostDivPageHolder">
            <div class="createPostPages defaultPage">
                <img class="createPostPagesIcon" src="/Pages/Enviroment/image.png">
                <p class="createPostPagesText">Choose photos here</p>
                <div class="choosePictureCreatePost">
                    <label for="createPostPagesPics" class="uploadTextPost">Select from computer</label>
                    <input type="file" name="createPostPagesPics" id="createPostPagesPics" class="createPostPagesPics" accept="image/*" style="display: none;">
                </div>
            </div>
        </div>
    `;
    createPostDiv.innerHTML = innerCreatePostDiv;
}
function createPostPicCaptionPage(img) {
    var createPostDivPageHolder = document.querySelector(".createPostDivPageHolder");
    var image = new FileReader();
    image.readAsDataURL(img);

    image.addEventListener("load", async () => {
        var newInnerCreatePostDiv = `
        <div class="createPostDivEditPhotoCaptionHolder"> 
            <div class="createPostDivEditPhotoHolder">
                <div class="createPostDivPicsCaptionClip">
                </div>
                <img src="${image.result}" class="createPostDivPicsCaption">
            </div>
            <div class="createPostDivEditCaptionHolder">
                <textarea type="textarea" class="captionCreatePostText" maxlength="2200" placeholder="Caption.."></textarea>
            </div>
        </div>
        
        `;
        createPostDivPageHolder.innerHTML = newInnerCreatePostDiv;

    })
}
var createPostBtn = document.querySelectorAll(".aFuntion");
createPostBtn[6].addEventListener("click", ()=>{
    showBG()
    createPopupPost();
    
})

function showBG() {
    var blackBG = document.createElement("span");
    blackBG.className = "blackBG show";
    document.body.appendChild(blackBG);
}
function hideBG() {
    if(document.querySelector(".blackBG")){
        document.querySelector(".blackBG").remove();
    }
}