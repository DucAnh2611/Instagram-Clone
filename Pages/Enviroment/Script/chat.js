var socket = io();

async function updateUserChat(){
    var getUserChatting = await fetch(document.URL, {
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        var accountReciever = document.querySelector(".accountReciever");

        var displayClass = "offline";
        var lastOnline = "Offline";

        if(data.activenow == true){
            displayClass = "online";
            lastOnline = "Active now";
        }else {
            displayClass = "offline";
            lastOnline = `Active ${transDateOffline(data.lastactive)} ago`;
        }

        accountReciever.innerHTML =`
            <a class="avatarRecieverHolder" href="/${data.username_user}"> 
                <div class="avatarRecieverClip"> 
                    <img class="avatarReciever" src=${data.avatar_path}> 
                </div>
                <span class="activeDiv ${displayClass}"> </span>
            </a>
            <div class="usernameRecieverHolder"> 
                <p class="usernameRecieverText">${data.username_user}</p>
                <p class="lastActiveUser">${lastOnline}</p>
            </div>`
    })
};
updateUserChat();

var sendBtn = document.querySelector(".sendMessage");
sendBtn.addEventListener('click', async (event) => {
    sendMessageChat();
});


socket.on('chat message', message => {
    updateFieldChat();
});
socket.on('likeMessage', countLike =>{
    // console.log(countLike)
    updateLikeMessage(countLike.messageid, countLike.countLike);
});
socket.on('deleteMes', status => {
    updateLineTextBox(status.messageid);
})
socket.on('loginAccount', state => {
    updateUserChat();
})
socket.on('offlineAccount', state => {
    updateUserChat();
})

async function updateFieldChat() {
    let respone = await fetch(document.URL + '/getChat', {
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
        var messagePart = document.querySelector(".messagePart");
        while(messagePart.firstElementChild) {messagePart.firstElementChild.remove()}
        data.forEach((message, index) => {
            var minutesConnect = 10;
            var secoundConnect = 300;
            var positionMessage = "singleText";

            if( index > 0) {
                if(timebetween(message.messagesendtime, data[index-1].messagesendtime)/(1000*60) >= minutesConnect) {
                    var messagePart = document.querySelector(".messagePart");
                    var timeDisplayHolder = document.createElement("div");
                    timeDisplayHolder.className = "timeDisplayHolder";
                    var timeDisplay = document.createElement("p");
                    timeDisplay.className = "timeDisplay";
                    timeDisplay.innerText = (new Date(message.messagesendtime)).toLocaleString()
                    messagePart.appendChild(timeDisplayHolder);

                    timeDisplayHolder.appendChild(timeDisplay)
                }
                if(index < data.length-1) {
                    positionMessage = convertTypeOfMessage(data[index-1], message, data[index+1], secoundConnect)
                }
                else {
                    if(message.sendername == data[index-1].sendername) {
                        if(timebetween(message.messagesendtime, data[index-1].messagesendtime)/1000 <= secoundConnect) {
                            positionMessage = "topText";
                        }
                        else {
                            positionMessage = "singleText";
                        }
                    }else {
                        positionMessage = "singleText";
                    }
                }
            }
            else {
                if(index ==0){
                    if(data[index+1]) {
                        if(message.sendername == data[index+1].sendername){
                            if(timebetween(message.messagesendtime, data[index+1].messagesendtime)/1000 <= secoundConnect) {
                                positionMessage = "bottomText";
                            }
                            else {
                                positionMessage = "singleText";
                            }
                        }else {
                            positionMessage = "singleText";
                        }
                    }
                    else {
                        positionMessage="singleText"
                    }
                }
            }
            createALineText(message, positionMessage);
        });
        var messagePart = document.querySelector(".messagePart");
        document.querySelector(".accountAndCustome").firstElementChild.innerText = localStorage.getItem('usernameLogined');
        messagePart.scrollTop = messagePart.scrollHeight;
    })
}
updateFieldChat();

function convertTypeOfMessage(msgBefore, msg , msgAfter, timeStep) {
    if(msg.sendername == msgBefore.sendername) {
        if(timebetween(msg.messagesendtime, msgBefore.messagesendtime)/1000 <= timeStep){
            if(msg.sendername == msgAfter.sendername){
                if(timebetween(msg.messagesendtime, msgAfter.messagesendtime)/1000 <= timeStep) {
                    return "middleText";
                }
                else {
                    return "topText";
                }
            }
            else {
                return "topText";
            }
        }
        else {
            if(msg.sendername == msgAfter.sendername){
                if(timebetween(msg.messagesendtime, msgAfter.messagesendtime)/1000 <= timeStep) {
                    return "bottomText";
                }
                else {
                    return "singleText";
                }
            }else {
                return "singleText";
            }
        }
    }
    else {
        if(msg.sendername == msgAfter.sendername){
            if(timebetween(msg.messagesendtime, msgAfter.messagesendtime)/1000 <= timeStep) {
                return "bottomText";
            }
            else {
                return "singleText";
            }
        } else {
            return "singleText";
        }
    } 
}
function timebetween(firstTime, secTime) {
    var leftTime = new Date(firstTime);
    var rightTime = new Date(secTime);
    return Math.abs(leftTime.getTime() - rightTime.getTime());
}
function createALineText(inputMessage, positionMessage) {
    var messagePart = document.querySelector(".messagePart");

    var chatAlineHolder = document.createElement("div");
    chatAlineHolder.className = "chatALineHolder";

    var avatarLineChatHolder = document.createElement("a");
    avatarLineChatHolder.className = "avatarLineChatHolder";
    avatarLineChatHolder.href = `/${inputMessage.sendername}`;
    var avatarLineChatClip = document.createElement("div");
    avatarLineChatClip.className = "avatarLineChatClip";
    var avatarLineChat = document.createElement("img");
    avatarLineChat.className = "avatarLineChat";

    if(positionMessage == "bottomText" || positionMessage == "middleText") {
        avatarLineChatHolder.style.visibility = "hidden";
    } else {
        avatarLineChat.src = inputMessage.senderavatar;
    }

    avatarLineChatHolder.appendChild(avatarLineChatClip);
    avatarLineChatClip.appendChild(avatarLineChat);

    var textHolder = document.createElement("div");
    textHolder.className= `textHolder ${positionMessage}`;
    var textChat = document.createElement("p");
    textChat.className = "textChat";
    textChat.innerText = inputMessage.messagecontent;

    var likeMessage = document.createElement("div");
    likeMessage.className = "likeMessage";
    var likedMessage = document.createElement("img");
    likedMessage.className = "likedMessage";
    likedMessage.src= "/Pages/Enviroment/heart_liked.png"
    var countLikedMessage = document.createElement("p");
    countLikedMessage.id = `messageid${inputMessage.messageid}`;
    countLikedMessage.className = "countLikedMessage";
    countLikedMessage.innerText = inputMessage.count;

    likeMessage.addEventListener("click", ()=>{
        showListLikeMessage(inputMessage.messageid);
    })
    
    textHolder.appendChild(likeMessage);
    likeMessage.appendChild(likedMessage);
    likeMessage.appendChild(countLikedMessage);

    var divListFuncForAline = document.createElement("div");
    divListFuncForAline.className= `divListFuncForAline`;
    divListFuncForAline.style.display = "none";

    var aFuncInListLike = document.createElement("button");
    aFuncInListLike.className = "aFuncInList like";
    aFuncInListLike.innerHTML = `<img src="/Pages/Enviroment/like_favorite_heart_5759.png" class="iconAFuncInList">`;

    var aFuncInListReply = document.createElement("button");
    aFuncInListReply.className = "aFuncInList reply";
    aFuncInListReply.innerHTML = `<img src="/Pages/Enviroment/reply.png" class="iconAFuncInList">`;
    aFuncInListReply.style.display = "none"
    var aFuncInListMore = document.createElement("button");
    aFuncInListMore.className = "aFuncInList more";
    aFuncInListMore.innerHTML = `<img src="/Pages/Enviroment/dot_more.png" class="iconAFuncInList">`;

    var popupOptionMoreMessage = document.createElement("div");
    popupOptionMoreMessage.className = "optionMessageHolder";
    popupOptionMoreMessage.style.display= "none";

    var firstOptions = document.createElement("div");
    firstOptions.className = "optionMessage firstOptions";
    var firstOptionsText = document.createElement("p");
    firstOptionsText.className = "optionMessageText";
    firstOptionsText.innerText = "Unsend";

    var secoundOptions = document.createElement("div");
    secoundOptions.className = "optionMessage secoundOptions";
    var secoundOptionsText = document.createElement("p");
    secoundOptionsText.className = "optionMessageText";
    secoundOptionsText.innerText = "Forward";

    if(inputMessage.messagestate == false) {
        aFuncInListLike.style.display ="none";
        aFuncInListReply.style.display ="none";
        aFuncInListMore.style.display ="none";

        textChat.classList.add("deleted");
        textChat.innerText= "This message was deleted!";
    }
    if(inputMessage.sendername == localStorage.getItem('usernameLogined')) {
        chatAlineHolder.classList.add("send");
        divListFuncForAline.style.flexDirection = "row-reverse";

        popupOptionMoreMessage.appendChild(firstOptions);
        firstOptions.appendChild(firstOptionsText);
    }
    else {
        chatAlineHolder.classList.add("recieve");
        firstOptions.style.display="none";
    }

    aFuncInListMore.appendChild(popupOptionMoreMessage);
    popupOptionMoreMessage.appendChild(secoundOptions);
    secoundOptions.appendChild(secoundOptionsText);

    messagePart.appendChild(chatAlineHolder);
    chatAlineHolder.appendChild(avatarLineChatHolder)
    chatAlineHolder.appendChild(textHolder);
    chatAlineHolder.appendChild(divListFuncForAline);
    divListFuncForAline.appendChild(aFuncInListLike);
    divListFuncForAline.appendChild(aFuncInListReply);
    divListFuncForAline.appendChild(aFuncInListMore);
    textHolder.appendChild(textChat);

    updateLikeMessage(inputMessage.messageid, inputMessage.count);

    chatAlineHolder.addEventListener("mouseover", () => {
        divListFuncForAline.style.display = "flex";
    });
    chatAlineHolder.addEventListener("mouseout", () => {
        divListFuncForAline.style.display = "none";
    });

    aFuncInListLike.addEventListener("click", ()=>{
        socket.emit('likeMessage', {
            messageid: inputMessage.messageid,
            usernameLike: localStorage.getItem("usernameLogined")
        })
    });
    aFuncInListMore.addEventListener("click", ()=>{
        popupOptionMoreMessage.style.display= "flex";
        firstOptions.addEventListener("mouseover", ()=>{
            popupOptionMoreMessage.style.display= "flex";
        });
        secoundOptions.addEventListener("mouseover", ()=>{
            popupOptionMoreMessage.style.display= "flex";
        });
        firstOptions.addEventListener("mouseout", ()=>{
            popupOptionMoreMessage.style.display= "none";
        });
        secoundOptions.addEventListener("mouseout", ()=>{
            popupOptionMoreMessage.style.display= "none";
        });
    });
    firstOptions.addEventListener("click", () =>{
        socket.emit('deleteMes', {
            messageid: inputMessage.messageid
        });
    });
}
function updateLikeMessage(messageid, countlike) {
    var message = document.getElementById(`messageid${messageid}`);
    message.innerText = countlike;
    if(countlike == 0){
        message.parentElement.style.display = "none";
        message.parentElement.parentElement.style.marginBottom = "0px";
    }
    else {
        if(countlike == 1) {
            message.style.display = "none";
        }else {
            message.style.display = "block";
        }
        message.parentElement.style.display = "flex";
        message.parentElement.parentElement.style.marginBottom = "5px";
    }
}
function updateLineTextBox(messageid) {
    var messageBox = document.getElementById(`messageid${messageid}`);
    messageBox.parentElement.parentElement.lastElementChild.innerText = "This message was deleted!";
    messageBox.parentElement.parentElement.lastElementChild.classList.add("deleted");
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
async function sendMessageChat() {
    var messageText = document.querySelector(".messageHolder");
    var textToDB = messageText.value;
    if(textToDB != "") {
        var  positionMessage = "singleText";
        createALineText({sendername: localStorage.getItem('usernameLogined'), messagecontent: textToDB, senderavatar: document.querySelector(".avatar").src, count:0, essagestate:true, positionMessage})

        var messagePart = document.querySelectorAll(".chatALineHolder");
        var spanSendingIcon = document.createElement("span");
        spanSendingIcon.className = "sendingText";
        messagePart[messagePart.length-1].appendChild(spanSendingIcon);

        messageText.value = '';
        messageText.focus();
        let sendTime = new Date;
        
        var sendMsg = await fetch(document.URL + '/sendMessage', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: localStorage.getItem('usernameLogined'),
                message: textToDB,
                sendTime: sendTime.toUTCString()
            })
        })
        socket.emit('chat message', {sendername: localStorage.getItem('usernameLogined'), messagecontent: textToDB});
        updateRecentChat();
    }
}
async function showListLikeMessage(messageid) {
    var listLike = await fetch(`${document.URL}/listLikeMessage?messageid=${messageid}`, {
        method:"POST"
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);

        var popupLikerHolder = document.createElement("div");
        popupLikerHolder.className = "popupLikerHolder"
        popupLikerHolder.innerHTML = `
            <div class="popupLiker titlePart">
                <p>Reactions</p>
                <button class="clostPopupLiker"> 
                    <img src = "/Pages/Enviroment/close.png">
                </button>
            </div>
            <div class="popupLiker bodyPart">

            </div>
        `;

        document.body.appendChild(popupLikerHolder)
        showBG();
        var clostPopupLiker = document.querySelector(".clostPopupLiker");
        clostPopupLiker.onclick = () => {
            hideBG();
            popupLikerHolder.remove();
        }
        var bodyPart = document.querySelector(".bodyPart");
        data.forEach(person => {
            let newPeron =document.createElement("div");
            newPeron.className = "aPersonHolder";
            var displayClass = "offline";
            var lastOnline = "Offline";
    
            if(person.isactive == true){
                displayClass = "online";
                lastOnline = "Active now";
            }else {
                displayClass = "offline";
                lastOnline = `Active ${transDateOffline(person.lastactive)} ago`;
            }
            newPeron.innerHTML = `
                <div class="aPersonAvatarHolder">
                    <div class="aPersonAvatarClip">
                        <img src="${person.avatar_path}">
                    </div>
                    <span class="activeDiv ${displayClass}"> </span>
                </div>
                <div class="aPersonNameHolder">
                    <p class="aPersonUsername">${person.username}</p>
                    <p class="aPersonACtive">${lastOnline}</p>
                </div>
                <div class="aPersonReactHolder">
                    <div class="aPersonReactClip">
                        <img src="/Pages/Enviroment/heart_liked.png">   
                    </div>
                </div>
            `;

            bodyPart.appendChild(newPeron);

            if(person.username == localStorage.getItem("usernameLogined")) {
                newPeron.onclick = ()=>{
                    socket.emit('likeMessage', {
                        messageid: messageid,
                        usernameLike: localStorage.getItem("usernameLogined")
                    });
                    hideBG();
                    popupLikerHolder.remove();
                }
            }
        }) 
    })
}