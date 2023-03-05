var socket = io();
window.addEventListener("beforeunload", function(event) {
    socket.emit('offlineAccount', {
        username: localStorage.getItem("usernameLogined")
    });
});
socket.emit('loginAccount', {
    username: localStorage.getItem('usernameLogined')
})