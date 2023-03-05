var socket = io();
localStorage.clear();

var submitSignupBtn =document.querySelector(".submit-signup");
submitSignupBtn.disabled = true;
submitSignupBtn.addEventListener("click", async ()=>{
    var listInputFields = document.querySelectorAll(".inputFields");

    var authSignup = await fetch("/singupInfo", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            emailOrPhone: listInputFields[0].value,
            fullname: listInputFields[1].value,
            username: listInputFields[2].value,
            password: listInputFields[3].value
        })
    })
    .then(res => res.json())
    .then((data) => {
        var stateSignup = document.querySelector(".stateSignup");
        var innerState = "";
        switch(data.status) {
            case 1:
                innerState= "Username is used!";
                break;
            case 2:
                innerState= "Email or phone is used!";
                break;
            case 3:
                innerState= "Username and 'email or phone' is used!";
                break;
            case 4:
                innerState= "Email is not valid";
                break;
            case 5:
                innerState= "Succesfull!";
                break;
            default:
                break;
        }
        stateSignup.innerText = innerState;
        stateSignup.style.display = "flex";
        localStorage.setItem('usernameLogined', listInputFields[2].value);
        if(data.status == 5) {
            socket.emit('loginAccount', {
                username: localStorage.getItem('usernameLogined')
            })
            window.location.href= `/edit`;
        }
    });
})

var validInputSignUp = [0,0,0,0];

var inputFields = document.querySelectorAll(".inputFields");
inputFields.forEach((field, index) => {
    field.addEventListener("input", (event) => {
        if(index == 0) {
            validInputSignUp[index] = returnMailOrPhoneNumber(event.target.value);
        }
        else {
            if(index!=1){
                validInputSignUp[index] = returnIfContaintSpace(event.target.value);
            }
            else {
                validInputSignUp[index] = 1;
            }
        }
        disableSubmit(checkValid(validInputSignUp));
    })
})

function disableSubmit(valid){
    if(valid) {
        submitSignupBtn.disabled = false;
    }
    else {
        submitSignupBtn.disabled = true;
    }
    
}
function checkValid(arrayValid) {
    console.log(arrayValid);
    for(let i =0; i< arrayValid.length; i++) {
        if (arrayValid[i] == 0) return false;
    }
    return true;
}
function returnIfContaintSpace(dataNotFilter){
    if(dataNotFilter.includes(" ")) {
        return 0;
    }
    else {
        return 1;
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