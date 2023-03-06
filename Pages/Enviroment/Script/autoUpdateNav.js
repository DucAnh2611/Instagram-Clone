async function UpdateNav() {
    let username_login = localStorage.getItem('usernameLogined');
    const respone = await fetch(`/home` , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username_login
        })
    })
    .then(res => res.json())
    .then((data) => {
        document.querySelector(".avatar").src = data.userInfor.avatar_path;
        document.querySelector(".toProfile").href = `/${data.userInfor.username_user}`;

    })
    
};
UpdateNav();