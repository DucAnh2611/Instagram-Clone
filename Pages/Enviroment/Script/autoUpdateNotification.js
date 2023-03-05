var notification = document.querySelector(".notification");
notification.addEventListener("click", ()=>{
    var searchPane = document.querySelector(".searchPane");
    var notificationPane  = document.querySelector(".notificationPane");
    if(notificationPane.classList.contains("hide")){
        notificationPane.classList.remove("hide");
        notificationPane.classList.add("show");
        if(searchPane.classList.contains("showSearch")) {
            searchPane.classList.remove("showSearch");
            searchPane.classList.add("hideSearch");
        }
    }else {
        notificationPane.classList.remove("show");
        notificationPane.classList.add("hide");
    }
})
async function getFullNoti() {
    const fullNotiFetch = await fetch('/notification/getFull', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined'),
        })
    })
    .then(res => res.json())
    .then((data) => {
        var listNotification = document.querySelector(".listNotification");
        while(listNotification.firstElementChild) listNotification.firstElementChild.remove()
        data.forEach((noti, index) => {
            var statusNotic = function () {
                if(noti.statenoti) {
                    return "seenNoti"
                }else {
                    return "notSeenNoti"
                }
            }
            var createANoti = document.createElement("div");
            createANoti.className = `aNotificationInList ${statusNotic()}`;
            listNotification.appendChild(createANoti);
            createANoti.addEventListener("click", async () => {
                console.log(noti.statenoti)
                if(!noti.statenoti) {
                    var logoNoti = document.querySelector(".notification");
                    var numberOfNotClickNoti = document.querySelectorAll(".notSeenNoti");
                    logoNoti.firstElementChild.innerText = numberOfNotClickNoti.length;
                    createANoti.classList.remove("notSeenNoti");
                    createANoti.classList.add("seenNoti");
                    await changeStateNoti(noti.notiid);
                }
                window.location.href = noti.descriptionnoti;
            })
            createANoti.innerHTML+=`
                <div class="avatarNotiHolder">
                    <div class="avatarNotiClip">
                        <img class="avatarNoti" src="${noti.sender_ava}">
                    </div>
                </div>
                <div class="contentNotiHolder">
                    <p class="contentTextNoti"> 
                        <a class="profileLink" href="/${noti.username_sender}"> ${noti.username_sender}</a> 
                        ${transformTypeNoti(noti.noticetype)}
                    </p>
                    <p class="timeNoti">${(new Date(noti.noticerectime)).toLocaleString()}</p>
                </div>
            `;
        });

    });
    var numberOfNotClickNoti = document.querySelectorAll(".notSeenNoti");
    if(numberOfNotClickNoti.length !=0){
        var logoNoti = document.querySelector(".notification");
        logoNoti.firstElementChild.innerHTML+= `
            <span class="numberOfNoti" style="background-color:var(--noti1); height:15px; width:15px; position: absolute; right: -30%; top: 30%; transform: translate(-50%, -50%); border-radius:100%; font-size: 0.85vh; font-weight: bold;display: grid; place-items: center; border: 3px solid var(--Color1); color: var(--Color1)"> ${numberOfNotClickNoti.length} <span>
        `;
    }
    document.querySelector(".lds-rollerHolder").style.visibility = "hidden";
}
getFullNoti();

function transformTypeNoti(type){
    switch(type) {
        case 1:
            return "liked your post";
        case 2:
            return "Commented on your post";
        case 3:
            return "are following you"
        default:
            break;
    }
}
async function changeStateNoti(notiid) {
    var changeNoti = fetch(`/notification/changeNoti?notiid=${notiid}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
}