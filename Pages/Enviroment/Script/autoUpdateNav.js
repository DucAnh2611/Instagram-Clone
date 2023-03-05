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
        document.querySelector(".avatar").src = data.avatar_path;
        document.querySelector(".toProfile").href = `/${data.username_user}`;

    })
    
};
UpdateNav();