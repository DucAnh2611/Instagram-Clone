var divLoading = document.createElement("div");
divLoading.className = "lds-rollerHolder";
divLoading.innerHTML = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`
document.body.appendChild(divLoading);

document.onreadystatechange = function () {
    document.onreadystatechange = function() {
        document.querySelector(".lds-rollerHolder").style.visibility = "visible";
    };
}
