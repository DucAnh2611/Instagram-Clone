async function updateInfoUser() {
    document.querySelector(".accountAndCustome").firstElementChild.innerText = localStorage.getItem('usernameLogined');
}
updateInfoUser();
function createPopupSearchUserChat() {
    var btnCreateNewConverstaion = document.querySelector(".sendMessageCrete");
    if(btnCreateNewConverstaion) {
        btnCreateNewConverstaion.addEventListener("click", () => {
            document.querySelector(".searchUserToCreateConversation").classList.add("show")
            document.querySelector(".searchUserToCreateConversation").classList.remove("hide")
            showBG();
        });
    }
    
    var btnbtnCreateNewConverstaionIcon = document.querySelector(".CreateChat");
    btnbtnCreateNewConverstaionIcon.addEventListener("click", () => {
        document.querySelector(".searchUserToCreateConversation").classList.add("show")
        document.querySelector(".searchUserToCreateConversation").classList.remove("hide")
        showBG();
    });

    var btnCloseCreateNewConversation = document.querySelector(".closeCreateConversation");
    btnCloseCreateNewConversation.addEventListener("click", ()=>{
        document.querySelector(".searchUserToCreateConversation").classList.remove("show")
        document.querySelector(".searchUserToCreateConversation").classList.add("hide");
        hideBG();
    });

    var searchInput = document.querySelector(".searchUser");
    searchInput.addEventListener("input", async (event) => {
        var recentSearch = document.querySelector(".suggestedUser");
        var resultsSearch = document.querySelector(".listSearchUser");
        if(recentSearch.classList.contains("show")){
            recentSearch.classList.remove("show")
            recentSearch.classList.add("hide");

            resultsSearch.classList.remove("hide");
            resultsSearch.classList.add("show");
        }
        if(event.target.value == "") {
            recentSearch.classList.remove("hide");
            recentSearch.classList.add("show");

            resultsSearch.classList.add("hide");
            resultsSearch.classList.remove("show");
        }else {
            //Lay trong database username_user, avatar, fulname
            const responeSearch = await fetch('/search?key=' + event.target.value, {
                method: "POST",
            })
            .then(res => res.json())
            .then((data) => {
                while(resultsSearch.firstElementChild) {resultsSearch.firstChild.remove()}
                data.forEach(userFind => {
                    var userResult_SearchHolder = createDivLinkToMessage(userFind);
                    resultsSearch.appendChild(userResult_SearchHolder);
                });
            })
        }
    });
}
createPopupSearchUserChat();
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

function createDivLinkToMessage(userFind) {
    var userResult_SearchHolder = document.createElement("a");
    userResult_SearchHolder.className = "userResult_SearchHolderMes messageSearch";
    userResult_SearchHolder.href = `/message/to/${userFind.username_user}`;  

    var userResult_AvatarPart = document.createElement("div");
    userResult_AvatarPart.className = "userResult_AvatarPart";

    var userResult_InforPart = document.createElement("div");
    userResult_InforPart.className = "userResult_InforPart";

    var userResult_AvatarUser = document.createElement("img");
    userResult_AvatarUser.className = "userResult_AvatarUser";
    userResult_AvatarUser.src = userFind.avatar_path;

    var userResult_username = document.createElement("p");
    userResult_username.className = "userResult_username";
    userResult_username.innerText = userFind.username_user;

    var userResult_fullname = document.createElement("p");
    userResult_fullname.className = "userResult_fullname";
    userResult_fullname.innerText = userFind.fullname;

    userResult_SearchHolder.appendChild(userResult_AvatarPart);
    userResult_AvatarPart.appendChild(userResult_AvatarUser);
    userResult_SearchHolder.appendChild(userResult_InforPart);
    userResult_InforPart.appendChild(userResult_username);
    userResult_InforPart.appendChild(userResult_fullname);

    return userResult_SearchHolder;
}