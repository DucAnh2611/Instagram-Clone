const pickGenderPopUp = document.querySelector(".pickGender");
pickGenderPopUp.addEventListener("click", () =>{

    var genderPicker = document.querySelector(".genderPicker");
    if(genderPicker.classList.contains("show")){
        genderPicker.classList.add("hide");
        genderPicker.classList.remove("show");
    hideBG();
    }  else{
        genderPicker.classList.add("show");
        genderPicker.classList.remove("hide");
    showBG();
    }
})

const pickGenderRadio = document.querySelectorAll(".GenderPickerInput");
pickGenderRadio.forEach(element => {
    element.addEventListener("click", (event)=>{
        pickGenderRadio.forEach(child => {
            if(child.checked) {
                child.checked = false;
            }
            event.target.checked = true;
        })
        var pickGenderCustom = document.getElementById("Custom");
        var customeInputText = document.querySelector(".customGender");
        if(event.target == pickGenderCustom) {
            customeInputText.style.display = "block";
        }else {
            customeInputText.style.display = "none";
        }
    }) 
})

const DoneGenderPicker = document.querySelector(".DoneGenderPicker");
DoneGenderPicker.addEventListener("click", () => {
    document.querySelector(".genderPicker").style.display.none;
    pickGenderRadio.forEach(element => {
        if(element.checked) {
            if(element.value == "Custom") {
                var customText = document.querySelector(".customGender");
                pickGenderPopUp.value = element.value + ": " + customText.value;
            } else {
                pickGenderPopUp.value = element.value;
            }
        }
        document.querySelector(".genderPicker").classList.remove("show");
        document.querySelector(".genderPicker").classList.add("hide");
        hideBG();
    });

})
const closeButtonGenderPicker = document.querySelector(".closeGenderPicker")
closeButtonGenderPicker.addEventListener("click", ()=>{
    document.querySelector(".genderPicker").classList.remove("show");
    document.querySelector(".genderPicker").classList.add("hide");
    hideBG();
})

var buttonClickChangePhoto = document.querySelector(".changeProfilePicture");
buttonClickChangePhoto.addEventListener("click", ()=>{
    var changePicture = document.querySelector(".changePicture");

    if(changePicture.classList.contains("show")) {
        changePicture.classList.remove("show");
        changePicture.classList.add("hide");
        hideBG();
    }
    else {
        changePicture.classList.add("show");
        changePicture.classList.remove("hide");
        var blackBG = document.createElement("span");
        blackBG.className = "blackBG show";
        document.body.appendChild(blackBG);
    }
})

var cancelChangePhoto = document.querySelector(".cancelChangePicture");
cancelChangePhoto.addEventListener("click", ()=> {
    var changePicture = document.querySelector(".changePicture");

    if(changePicture.classList.contains("show")) {
        changePicture.classList.remove("show");
        changePicture.classList.add("hide");
        hideBG();
    }
});


async function UpdateFields()    {
    var textAreaTarget = document.getElementById("bio");
    var textAreaNumberOfCharText = document.getElementById("textareaCount");

    textAreaTarget.addEventListener("input", ()=>{
        stringText = String(textAreaTarget.value).length;
        textAreaNumberOfCharText.innerText = String(stringText) + "/150";
    })
    const respone = await fetch(`/edit/getDataUser`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: localStorage.getItem('usernameLogined')
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelector(".avatarEditProfile").src= data.pathIMG;

        document.querySelector(".usernameProfile").innerText = data.username;
        var listInputFields = document.querySelectorAll(".inputEdit");
        listInputFields[0].value = data.fullname;
        listInputFields[1].value = data.username;
        listInputFields[3].value = data.bio
        listInputFields[4].value = data.email;
        listInputFields[5].value = data.phone;
        if(data.activephone == true) {
            listInputFields[6].display= "none";
        }
        else {
            listInputFields[6].display= "block";
        }
        listInputFields[7].value = converUTCToDate(data.dateofbirth);
        listInputFields[7].addEventListener("change", (event) => {
            if((new Date(event.target.value)).getTime() - (new Date()).getTime() > 0){
                listInputFields[7].value = converUTCToDate( (new Date()).toUTCString() );
            }
        })
        listInputFields[8].value = data.gender;

        textAreaNumberOfCharText.innerText =`${String(listInputFields[3].value).length}/150`;
        document.querySelector(".lds-rollerHolder").style.visibility = "hidden";
    })
};
UpdateFields();
//input field
var changePic = document.querySelector(".imageChange")
changePic.addEventListener("input", async (event)=>{
    var changePicture = document.querySelector(".changePicture");

    changePicture.classList.remove("show");
    changePicture.classList.add("hide");
    hideBG();

    document.querySelector(".loadingPictureWaiting").style.display = "block";
    var imgNew = event.target.files[0];
    var srcNew = () =>{
        var image = new FileReader();
        image.readAsDataURL(imgNew);
        image.addEventListener("load", async () => {

            var fetchImgUrl = await fetch(`/edit/changePic`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: localStorage.getItem('usernameLogined'),
                    srcNewPicSave: image.result
                })
            })
            .then(res => res.json())
            .then((data) => {
                document.querySelector(".avatar").src= data.pathIMG;
                document.querySelector(".avatarEditProfile").src= data.pathIMG;
                document.querySelector(".loadingPictureWaiting").style.display = "none";
                
            });
        })
    }
    srcNew();
})

var email = document.getElementById("email");
email.addEventListener("input", async (event) => {
    if(returnMailOrPhoneNumber(event.target.value)){
        var checkSamePhonenumber = await fetch(`${document.URL}/checkMail?mail=${event.target.value}&username=${localStorage.getItem("usernameLogined")}`,{method: "POST"})
        .then(res => res.json())
        .then(data => {
            if(data.status == "ok") {
                email.classList.remove("notok");
                email.classList.add("ok");

            }else {
                email.classList.add("notok");
                email.classList.remove("ok");
            }
        })
        
    }else {
        if(email.classList.contains("notok")) email.classList.remove("notok");
        if(email.classList.contains("ok")) email.classList.remove("ok");
    }
})

var phoneNumber = document.getElementById("phoneNumber");
var confirmPhoneNumber = document.querySelector(".confirmPhoneNumber")
phoneNumber.addEventListener("input", async (event) => {
    if(returnMailOrPhoneNumber(event.target.value)){
        var checkSamePhonenumber = await fetch(`${document.URL}/checkPhone?phone=${event.target.value}&username=${localStorage.getItem("usernameLogined")}`,{method: "POST"})
        .then(res => res.json())
        .then(data => {
            if(data.status == "ok") {
                phoneNumber.classList.remove("notok");
                confirmPhoneNumber.style.display = "block";

            }else {
                phoneNumber.classList.add("notok");
            }
        })
        
    }else {
        if(phoneNumber.classList.contains("notok")) phoneNumber.classList.remove("notok")
        confirmPhoneNumber.style.display = "none";
    }
})

var singupSubmit = document.querySelector(".submit");
singupSubmit.addEventListener("click",async () => {
    var userListConfirm = document.querySelectorAll(".inputEdit");

    var updateUserInfor = await fetch('/edit/authEdit', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fullname: userListConfirm[0].value,
            beforeUsername: localStorage.getItem('usernameLogined'),
            username: userListConfirm[1].value,
            bio: userListConfirm[3].value,
            email: userListConfirm[4].value,
            phoneNumber: userListConfirm[5].value,
            dateOfBirth: userListConfirm[7].value,
            gender: userListConfirm[8].value,
        })
    })
    .then(res => res.json())
    .then((data) => {
        var changeStatusPopups = document.querySelector(".changeStatus");
        changeStatusPopups.classList.remove("hide");
        changeStatusPopups.classList.add("show")
        setTimeout(() => {
            changeStatusPopups.classList.add("hide");
            changeStatusPopups.classList.remove("show");
        }, 1500);
        var textNoti = document.querySelector(".textNotice");
        var iconNoti = document.querySelector(".inconNotice");

        if(data.status == "ok") {
            localStorage.setItem('usernameLogined', data.newUsernameLogined);
            UpdateFields();
            textNoti.innerText= "Change profile succesfully!";
            iconNoti.src = "/Pages/Enviroment/accept.png"
            
        } 
        else if(data.status == "sameUsername") {
            textNoti.innerText= "Change profile fail!\nUsername is used";
            iconNoti.src = "/Pages/Enviroment/cross.png"
        }
        else if(data.status == "sameEmail") {
            textNoti.innerText= "Change profile fail!\nEmail is used";
            iconNoti.src = "/Pages/Enviroment/cross.png"
        }
        else if(data.status == "samePhone") {
            textNoti.innerText= "Change profile fail!\nPhone is used";
            iconNoti.src = "/Pages/Enviroment/cross.png"
        }
    });
})

confirmPhoneNumber.addEventListener("click", async () =>{
    var phonenumber = await document.getElementById("phoneNumber");
    var activePhone = await fetch(`${document.URL}/activePhone?phonenumber=${phonenumber.value}&username=${localStorage.getItem("usernameLogined")}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(data=>{
        var changeStatusPopups = document.querySelector(".changeStatus");
        changeStatusPopups.classList.remove("hide");
        changeStatusPopups.classList.add("show")
        setTimeout(() => {
            changeStatusPopups.classList.add("hide");
            changeStatusPopups.classList.remove("show");
        }, 1500);
        var textNoti = document.querySelector(".textNotice");
        var iconNoti = document.querySelector(".inconNotice");
        if(data.status == "ok") {
            confirmPhoneNumber.style.display="none";
            textNoti.innerText= "Confirm succesfully!";
            iconNoti.src = "/Pages/Enviroment/accept.png";
            
        } else if(data.status == "sameUsername") {
            confirmPhoneNumber.focus();
            textNoti.innerText= "Confirm fail!";
            iconNoti.src = "/Pages/Enviroment/cross.png"
        }
    })
});
//ham ho tro

function showBG() {
    var blackBG = document.createElement("span");
    blackBG.className = "blackBG show";
    document.body.appendChild(blackBG);
}
function hideBG() {
    if(document.querySelector(".blackBG")){
        document.querySelector(".blackBG").remove();
    }
}

function returnMailOrPhoneNumber(dataNotFilter) {
    if(dataNotFilter.includes(" ")) {
      return 0;
    } else {
      var emmailForm = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
      if(emmailForm.test(dataNotFilter)) {
        return 1;
      }else {
        var phoneno = /^\d{10}$/;
        if(phoneno.test(dataNotFilter)) {
          return 1;
        }
        else {
            return 0;
        }
      }
    }
  }
function converUTCToDate(dateUTC){
    var newDateUTC = new Date(dateUTC);
    var month = newDateUTC.getMonth() +1;
    if(month <10) {
        month = `0${month}`
    }
    var date = newDateUTC.getDate();
    if(date <10) {
        date = `0${date}`
    }
    return `${newDateUTC.getFullYear()}-${month}-${date}`;
}