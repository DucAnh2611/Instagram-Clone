var moreButton = document.querySelector(".Dashboard_navBar-more");
moreButton.addEventListener("click", ()=>{
    var menuMore = document.querySelector(".moreClicked");
    if(menuMore.classList.contains("hideMenu")) {
        menuMore.classList.add("showMenu");
        menuMore.classList.remove("hideMenu");
    }
    else {
        menuMore.classList.remove("showMenu");
        menuMore.classList.add("hideMenu");
    }

})

var popupLogout = document.createElement("div");