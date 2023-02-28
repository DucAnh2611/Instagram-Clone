window.onload = async () => {
    var getUserChatting = await fetch(document.URL, {
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        var accountReciever = document.querySelector(".accountReciever");
        accountReciever.innerHTML =`
            <a class="avatarRecieverHolder" href="/${data.username_user}"> 
                <div class="avatarRecieverClip"> 
                    <img class="avatarReciever" src=${data.avatar_path}> 
                </div>
            </a>
            <div class="usernameRecieverHolder"> 
                <p class="usernameRecieverText">${data.username_user}</p>
                <p class="fullnameRecieverText">${data.fullname}</p>
            </div>`
    })
}
var socket = io();
var sendBtn = document.querySelector(".sendMessage");
sendBtn.addEventListener('click', async (event) => {
    var messageText = document.querySelector(".messageHolder");
    var textToDB = messageText.innerText;
    if(textToDB != "") {
        var  positionMessage = "singleText";
        createALineText({sendername: localStorage.getItem('usernameLogined'), messagecontent: textToDB, senderavatar: document.querySelector(".avatar").src}, positionMessage)

        var messagePart = document.querySelectorAll(".chatALineHolder");
        var spanSendingIcon = document.createElement("span");
        spanSendingIcon.className = "sendingText";
        messagePart[messagePart.length-1].appendChild(spanSendingIcon);

        messageText.innerText = "";
        messageText.focus();
        let sendTime = new Date;
        
        let sendMsg = await fetch(document.URL + '/sendMessage', {
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
});
socket.on('chat message', message => {
    updateFieldChat();
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
                    messagePart.innerHTML += `
                        <div class="timeDisplayHolder">
                            <p class="timeDisplay">${(new Date(message.messagesendtime)).toLocaleString()}</p>
                        </div>
                    `;
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

    if(inputMessage.sendername == localStorage.getItem('usernameLogined')) {
        chatAlineHolder.classList.add("send");
    }
    else {
        chatAlineHolder.classList.add("recieve");
    }

    var textHolder = document.createElement("div");
    textHolder.className= `textHolder ${positionMessage}`;
    var textChat = document.createElement("p");
    textChat.className = "textChat";
    textChat.innerText = inputMessage.messagecontent;

    messagePart.appendChild(chatAlineHolder);
    chatAlineHolder.appendChild(avatarLineChatHolder)
    chatAlineHolder.appendChild(textHolder);
    textHolder.appendChild(textChat)

}
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
        var usernameLogin = localStorage.getItem('usernameLogined')
        data.forEach(messageRelation => {
            if(messageRelation.sendername == usernameLogin){
                createListRecentChat({avatar_path: messageRelation.recieverava, username: messageRelation.recievername, fullname: messageRelation.recieverfullname})
            }
            else if (messageRelation.recievername == usernameLogin){
                createListRecentChat({avatar_path: messageRelation.senderava, username: messageRelation.sendername, fullname: messageRelation.senderfullname})
            }
        });
    })
}