var socket = io();
socket.on('loginAccount', state => {
    updateRecentChat();
})
socket.on('offlineAccount', state => {
    updateRecentChat();
})
async function updateRecentChat() {
    let respone = await fetch('/message/recentChat', {
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
        var listMessage = document.querySelector(".listMessage");
        while(listMessage.firstElementChild) listMessage.firstElementChild.remove();
        var usernameLogin = localStorage.getItem('usernameLogined');
        data.forEach(messageRelation => {
            if(messageRelation.sendername == usernameLogin){
                createListRecentChat({
                    avatar_path: messageRelation.recieverava,
                    username: messageRelation.recievername,
                    fullname: messageRelation.recieverfullname,
                    isactive: messageRelation.recieveractive,
                    lastactive: messageRelation.recieverlastactive,
                })
            }
            else if (messageRelation.recievername == usernameLogin){
                createListRecentChat({
                    avatar_path: messageRelation.senderava,
                    username: messageRelation.sendername,
                    fullname: messageRelation.senderfullname,
                    isactive: messageRelation.senderactive,
                    lastactive: messageRelation.senderlastactive,
                })
            }
        });
        document.querySelector("body").style.visibility = "visible";
        document.querySelector(".lds-rollerHolder").style.visibility = "hidden";   
    })
}
updateRecentChat();

function createListRecentChat(person) {
    var listMessage = document.querySelector(".listMessage");
    var aPersonChatList = document.querySelectorAll(".aPersonChat");
    var foundPerson = false;
    aPersonChatList.forEach(personInList => {
        if(personInList.children[1].children[0].innerText == person.username) {
            foundPerson = true;
        }
    })

    if(!foundPerson) {
        var displayClass = "offline";
        var lastOnline = "Offline";

        if(person.isactive == true){
            displayClass = "online";
            lastOnline = "Active now";
        }else {
            displayClass = "offline";
            lastOnline = `Active ${transDateOffline(person.lastactive)} ago`;
        }
        listMessage.innerHTML += `
        <a class="aPersonChat" href="/message/to/${person.username}">
            <div class="avatarChatHolder">
                <div class="avatarClipHolder">
                    <img src="${person.avatar_path}" class= "avatarPicChat">
                </div>
                <span class="activeDiv ${displayClass}"> </span>
            </div>
            <div class="nameAndFullnameHolder">
                <p class="nameText">${person.username}</p>
                <p class="lastOnline">${lastOnline}</p>
            </div>
        </a> `
    }

}
var sendMessageRequest = document.querySelector(".sendMessage");
if(sendMessageRequest!= null) {
    sendMessageRequest.addEventListener("click", () =>{
        updateRecentChat();
    })
}

function transDateOffline(dateOffline){
    var time = ((new Date()).getTime() - (new Date(dateOffline)).getTime()) ;
    timeResult = 0;
    if(parseInt(time/(1000*60*60*24)) >=1) {
        return `${parseInt(time/(1000*60*60*24))}d`;
    }
    else if(parseInt(time/(1000*60*60)) >=1) {
        return `${parseInt(time/(1000*60*60))}h`;
    }
    else if(parseInt(time/(1000*60)) >=1) {
        return `${parseInt(time/(1000*60))}m`;
    }
    else if(parseInt(time/(1000)) >= 0) {
        return `${parseInt(time/(1000))}s`;
    }
}