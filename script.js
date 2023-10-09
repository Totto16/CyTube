function setIcon() {
    var div = document.createElement('div');
    div.innerHTML = '<link rel="icon" type="image/x-icon" href="https://yt3.googleusercontent.com/ytc/APkrFKaZ1POoLFYwBP_7riSuRQgp53v1j-Biw68QR4ay=s900-c-k-c0x00ffffff-no-rj">';
    document.head.appendChild(div.firstChild);
}

function setBranding() {
    var div = document.createElement('div');
    div.innerHTML = '<a class="navbar-brand" href="https://twitch.tv/stegi">stegiTube</a>';
    document.getElementsByClassName('navbar-brand')[0].replaceWith(div.firstChild);   
}
 
setIcon();
setBranding();
