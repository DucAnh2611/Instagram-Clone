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
                var userResult_SearchHolder = createDivLinkToProfile(userFind, 1);
                resultsSearch.appendChild(userResult_SearchHolder);

                userResult_SearchHolder.addEventListener("click", async () =>{
                    addToRecentSearch(userFind);
                })
            });
        })
    }
});
// async function loadRecentSearch();
function createDivLinkToProfile(userFind, type) {
    var userResult_SearchHolder = document.createElement("div");
    userResult_SearchHolder.className = "userResult_SearchHolder";

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

    if(type == 0) {
        var buttonRemoveRecent = document.createElement("button");
        buttonRemoveRecent.className = "buttonRemoveRecent";
        var iconRemoveRecent =document.createElement("img");
        iconRemoveRecent.src = "/Pages/Enviroment/close.png";

        buttonRemoveRecent.addEventListener("click", async (event)=>{
            await removeFromRecentSearch(userFind); 
            event.target.parentElement.parentElement.remove()
        })

        userResult_SearchHolder.appendChild(buttonRemoveRecent);
        buttonRemoveRecent.appendChild(iconRemoveRecent);
    }

    return userResult_SearchHolder;
}
async function addToRecentSearch(userFind) {
    var addToRecent = await fetch(`/search/addRecentSearch?username_find=${userFind.username_user}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined')
        })
    })
    .then(res => res.json())
    .then(data => {
        window.location.href = `/${userFind.username_user}`
    })
}
async function removeFromRecentSearch(userFind) {
    var removeRecentPer = await fetch(`/search/removeFromRecent?username_find=${userFind.username_user}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined')
        })
    })
}
async function getRecentSearch() {
    var getAllRecent = await fetch('/getAllRecent', {
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined')
        })
    })
    .then(res => res.json())
    .then(data=> {
        data.forEach(person => {
            var resultRecent = document.querySelector(".resultRecent");
            var userResult_SearchHolder = createDivLinkToProfile(person, 0);
            resultRecent.appendChild(userResult_SearchHolder);
        })
    })
}
getRecentSearch();
