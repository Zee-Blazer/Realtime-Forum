const socket = io();

const message = document.querySelector("#message");
const send = document.querySelector('#send');
const $locationBtn = document.getElementById("sendLocation");
const $messagesCont = document.querySelector('#messages');

const $formData = document.querySelector("#message_info");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const linkTemplate = document.querySelector("#link-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messagesCont.lastElementChild;

    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageheight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messagesCont.offsetHeight

    // Height of messages container
    const containerHeight = $messagesCont.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messagesCont.scrollTop + visibleHeight;

    if(containerHeight - newMessageheight <= scrollOffset) {
        $messagesCont.scrollTop = $messagesCont.scrollHeight
        console.log("Working");
    }

    console.log("Working");
}

const submitForm = (e) => {
    e.preventDefault();

    send.setAttribute('disabled', 'disabled');
    socket.emit('sendMsg', message.value, (err) => {
        send.removeAttribute("disabled");
        message.value = "";
        message.focus();

        if(err){
            return console.log(err);
        }
        console.log("Message Delievered!!");
    });
}

socket.on("message", (msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate, { 
        username: msg.username,
        message: msg.text, 
        createdAt: moment(msg.createdAt).format("h:mm a")
    });
    $messagesCont.insertAdjacentHTML("beforeend", html)

    autoScroll();
});

socket.on("locationMessage", (url) => {
    console.log(url);
    const html = Mustache.render(linkTemplate, { 
        username: url.username,
        link: url.text, 
        createdAt: moment(url.createdAt).format("h:mm a")
    });
    $messagesCont.insertAdjacentHTML("beforeend", html);

    autoScroll();
});

socket.on("roomData",({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users });
    document.querySelector("#sidebar").innerHTML = html
})

send.addEventListener("click", submitForm)

$formData.addEventListener("submit", submitForm)

$locationBtn.addEventListener("click", () => {
    if(!navigator.geolocation){
        return alert("Browser doesn't have support for this...")
    }

    // Disable Button
    $locationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition( (position) => {
        
        socket.emit(
            "sendLocation", 
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            () => {
                $locationBtn.removeAttribute("disabled"); // Enable Button
                console.log("Location shared!");
            }
        )
    } )
})

socket.emit("join", { username, room }, (err) => {
    if(err){
        alert(err);
        location.href = "/";
    }
})
