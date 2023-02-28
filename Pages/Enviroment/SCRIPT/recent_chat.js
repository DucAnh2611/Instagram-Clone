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
        var usernameLogin = localStorage.getItem('usernameLogined');
        data.forEach(messageRelation => {
            if(messageRelation.sendername == usernameLogin){
                createListRecentChat({avatar_path: messageRelation.recieverava, username: messageRelation.recievername, fullname: messageRelation.recieverfullname})
            }
            else if (messageRelation.recievername == usernameLogin){
                createListRecentChat({avatar_path: messageRelation.senderava, username: messageRelation.sendername, fullname: messageRelation.senderfullname})
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
        listMessage.innerHTML += `
        <a class="aPersonChat" href="/message/to/${person.username}">
            <div class="avatarChatHolder">
                <div class="avatarClipHolder">
                    <img src="${person.avatar_path}" class= "avatarPicChat">
                </div>
            </div>
            <div class="nameAndFullnameHolder">
                <p class="nameText">${person.username}</p>
                <p class="fullnameText">${person.fullname}</p>
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
