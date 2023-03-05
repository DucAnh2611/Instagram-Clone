var socket = io();

localStorage.clear();
const listPicture = document.querySelectorAll(".refresh");
var currentPicIndex = 0;

setInterval(() => {
    listPicture[currentPicIndex].classList.remove("active");
    if(currentPicIndex == listPicture.length -1) {
        currentPicIndex =0;
    }else {
        currentPicIndex ++;
    }
    listPicture[currentPicIndex].classList.add("active");
    document.querySelector("body").style.visibility = "visible";
document.querySelector(".lds-rollerHolder").style.visibility = "hidden";
}, 2000)
var usernameLogin = document.getElementById("username");
usernameLogin.addEventListener("input", ()=> {
    hideResult();
})
var passwordLogin = document.getElementById("password");
passwordLogin.addEventListener("input", ()=> {
    hideResult();
})

var submitBtn = document.querySelector(".submit-login");
submitBtn.addEventListener("click", async () => {
    var authLogin = await fetch("/auth", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: document.querySelector(".username-Login").value,
            password: document.querySelector(".password-Login").value
        })
    })
    .then(res => res.json())
    .then((data) => {
        if(data.status == 1) {
            localStorage.setItem('usernameLogined', data.username);
            socket.emit('loginAccount', {
                username: localStorage.getItem('usernameLogined')
            })
            window.location.href = "/home";
        }
        else {
            var resultLogin = document.querySelector(".resultLogin");
            resultLogin.style.display = "flex";
            switch(data.status) {
                case 0:
                    resultLogin.innerText = "Sai mật khẩu";
                    break;
                case 2:
                    resultLogin.innerText = "Không tồn tại tài khoản";
                    break;
                default:
                    break;
            }
        }
        
    });
})
function hideResult() {
    var resultLogin = document.querySelector(".resultLogin");
    resultLogin.style.display = "none";
}