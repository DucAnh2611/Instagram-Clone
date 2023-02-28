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

var inputCheck = document.getElementById("dateOfBirth")
inputCheck.addEventListener("input", (event) => {
    console.log(inputCheck.value)
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
        if(!data.activephone) {
            listInputFields[6].display="none";
        }
        else{
            listInputFields[6].display = "block"
        }
        listInputFields[7].value = data.dateofbirth;
        listInputFields[8].value = data.gender;
        console.log(String(textAreaTarget.innerText).length)
        textAreaNumberOfCharText.innerText =`${String(listInputFields[3].value).length}/150`;
        document.querySelector(".lds-rollerHolder").style.visibility = "hidden";
    })
};
UpdateFields();
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
var phoneNumber = document.getElementById("phoneNumber");
var confirmPhoneNumber = document.querySelector(".confirmPhoneNumber")
if(phoneNumber.innerText == ""){
    confirmPhoneNumber.style.display = "none";
}
phoneNumber.addEventListener("input", (event) => {
    if(returnMailOrPhoneNumber(event.target.value)){
        confirmPhoneNumber.style.display = "block";
    }else {
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
            
        } else if(data.status == "sameUsername") {
            textNoti.innerText= "Change profile fail!";
            iconNoti.src = "/Pages/Enviroment/cross.png"
        }
    });
})

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