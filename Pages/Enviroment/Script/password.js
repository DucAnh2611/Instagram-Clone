//kiem tra dieu kien cua password
var submitBtnChange =document.querySelector(".ChangeSubmitBtn");
submitBtnChange.addEventListener("click", async ()=>{
    var inputFields = document.querySelectorAll(".inputEdit");
    var oldPass = inputFields[0].value;
    var newPass = inputFields[1].value;
    var confirmPass = inputFields[2].value;

    var result = fetch(document.URL + '/authChange', {
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined'),
            old_pass: oldPass,
            new_pass: newPass,
            confirm_pass: confirmPass
        })
    }).then(response => response.json())
    .then(data => {
        var changeStatusPopups = document.querySelector(".changeStatus");
        changeStatusPopups.classList.remove("hide");
        changeStatusPopups.classList.add("show")
        setTimeout(() => {
            changeStatusPopups.classList.add("hide");
            changeStatusPopups.classList.remove("show");
        }, 1500);
        var textNoti = document.querySelector(".textNotice");
        var iconNoti = document.querySelector(".inconNotice");
        if(data.changed == "done"){
            textNoti.innerText= "Change password succesfully!";
            iconNoti.src = "/Pages/Enviroment/accept.png"
        } else {
            iconNoti.src = "/Pages/Enviroment/cross.png"
            switch(data.changed){
                case "odlNewSame":
                    textNoti.innerText= "The new password is the same as the old password!";
                    break;
                case "newConfirmWrong":
                    textNoti.innerText= "The confỉm password does not match the new password!";
                    break;
                case  "oldPassWrong":
                    textNoti.innerText= "Old password is incorrect!";
                    break;
            }
        }
        inputFields[0].value = "";
        inputFields[1].value = "";
        inputFields[2].value = "";
    })
})
//cap nhap cac link