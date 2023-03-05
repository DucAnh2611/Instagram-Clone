var functionNavbar = document.querySelector(".search");
functionNavbar.addEventListener("click", () => {
    var searchPane = document.querySelector(".searchPane");
    var notificationPane  = document.querySelector(".notificationPane");
    if(searchPane.classList.contains("hideSearch")) {
        searchPane.classList.add("showSearch");
        searchPane.classList.remove("hideSearch");
        if(notificationPane.classList.contains("show")){
            notificationPane.classList.remove("show");
            notificationPane.classList.add("hide");
        }
    }
    else {
        searchPane.classList.remove("showSearch");
        searchPane.classList.add("hideSearch");
    }
})
var searchInput = document.querySelector(".searchInput");
searchInput.addEventListener("input", async (event) => {
    var recentSearch = document.querySelector(".recentSearch");
    var resultsSearch = document.querySelector(".resultSearch");
    if(recentSearch.classList.contains("showMenu")){
        recentSearch.classList.remove("showMenu")
        recentSearch.classList.add("hideMenu");

        resultsSearch.classList.remove("hideMenu");
        resultsSearch.classList.add("showMenu");
    }
    if(event.target.value == "") {
        recentSearch.classList.remove("hideMenu");
        recentSearch.classList.add("showMenu");

        resultsSearch.classList.add("hideMenu");
        resultsSearch.classList.remove("showMenu");
    }else {
        //Lay trong database username_user, avatar, fulname
        const responeSearch = await fetch('/search?key=' +event.target.value, {
            method: "POST",
        })
        .then(res => res.json())
        .then((data) => {
            while(resultsSearch.firstElementChild) {resultsSearch.firstChild.remove()}
            data.forEach(userFind => {
                var userResult_SearchHolder = createDivLinkToProfile(userFind);
                resultsSearch.appendChild(userResult_SearchHolder);

                userResult_SearchHolder.addEventListener("click", () =>{
                var resultRecent = document.querySelector(".resultRecent");
                var saveResultToRecent = createDivLinkToProfile(userFind);

                    if(resultRecent.firstElementChild!= null) {
                        var found = false;
                        console.log(userFind);
                        for(let i =0 ; i< resultRecent.childElementCount; i++){
                            console.log(resultRecent.children[i].children[1].children[0].innerText);
                            found = false;
                            if(resultRecent.children[i].children[1].children[0].innerText == userFind.username_user) {
                                found = true;
                                i = resultRecent.childElementCount+1;
                            }
                        }
                        if(!found){
                            console.log("true")
                            resultRecent.appendChild(saveResultToRecent);
                        }
                    } else {
                        resultRecent.appendChild(saveResultToRecent);
                    }
                })
            });
        })
    }
});

function createDivLinkToProfile(userFind) {
    var userResult_SearchHolder = document.createElement("a");
    userResult_SearchHolder.className = "userResult_SearchHolder";
    userResult_SearchHolder.href = `/${userFind.username_user}`

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

