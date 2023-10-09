"use strict";
function siteChanged() {
    throw new Error("An Error occurred, the site changed, please contact the developers of this script to modify it!");
}
function setIcon() {
    const div = document.createElement("div");
    div.innerHTML =
        '<link rel="icon" type="image/x-icon" href="https://yt3.googleusercontent.com/ytc/APkrFKaZ1POoLFYwBP_7riSuRQgp53v1j-Biw68QR4ay=s900-c-k-c0x00ffffff-no-rj">';
    if (div.firstChild === null) {
        return siteChanged();
    }
    document.head.appendChild(div.firstChild);
}
function setBranding() {
    const div = document.createElement("div");
    div.innerHTML =
        '<a class="navbar-brand" href="https://twitch.tv/stegi">stegiTube</a>';
    const navBars = document.getElementsByClassName("navbar-brand");
    if (div.firstChild === null || navBars.length == 0) {
        return siteChanged();
    }
    navBars[0].replaceWith(div.firstChild);
}
let roleMappings = {
    op: "userlist_op",
    owner: "userlist_owner",
    guest: "userlist_guest",
    normal: null,
};
let NULLTOKEN = "__NULL__";
let reversedRoleMapping = (() => {
    return Object.fromEntries(Object.entries(roleMappings).map(([role, clazz]) => {
        if (clazz === null) {
            return [NULLTOKEN, role];
        }
        return [clazz, role];
    }));
})();
function roleToClassName(role) {
    return roleMappings[role];
}
function getRoleByClassList(list) {
    if (list.length === 0) {
        return reversedRoleMapping[NULLTOKEN];
    }
    for (const clazz of Array.from(list)) {
        const mappedRole = reversedRoleMapping[clazz];
        if (mappedRole !== undefined) {
            return mappedRole;
        }
    }
    // log an error and return the default user
    console.error(new Error(`Couldn't find role by classList with classes: ${list}\nThis is the fault of the developer, by not adding all available user to the correct mapping!`));
    return reversedRoleMapping[NULLTOKEN];
}
function addOrModifyStyles(styles, id) {
    const head = document.head ?? document.getElementsByTagName("head")[0];
    const isPresent = document.getElementById(id) !== null;
    let styleElement;
    if (isPresent) {
        styleElement = document.getElementById(id);
    }
    else {
        styleElement = document.createElement("style");
        styleElement.id = id;
        styleElement.type = "text/css";
        head.appendChild(styleElement);
    }
    styleElement.innerHTML = styles;
}
function addStylesForUsers(userList) {
    let styles = "";
    for (const { name, color } of userList) {
        styles += `
.chat-msg-${name} .username {
    color:${color} !important;
}
`;
    }
    addOrModifyStyles(styles, "usernames-styles-custom-id");
}
// from: https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
let observeDOM = (() => {
    const MutationObserver = window.MutationObserver ??
        window.WebKitMutationObserver;
    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1)
            return;
        if (MutationObserver) {
            // define a new observer
            const mutationObserver = new MutationObserver(callback);
            // have the observer observe for changes in children
            mutationObserver.observe(obj, { childList: true, subtree: true });
            return mutationObserver;
        }
        // browser support fallback
        else if (window.addEventListener) {
            obj.addEventListener("DOMNodeInserted", callback, false);
            obj.addEventListener("DOMNodeRemoved", callback, false);
        }
    };
})();
// this colors users according to their role color!
function attachUserColorListener() {
    const userListElement = document.getElementById("userlist");
    if (userListElement === null) {
        return siteChanged();
    }
    function calculateUserList(elem) {
        const userList = [];
        for (let i = 0; i < elem.children.length; ++i) {
            const child = elem.children.item(i);
            const userNameSpan = child.children[1];
            const role = getRoleByClassList(userNameSpan.classList);
            const color = getComputedStyle(userNameSpan).color;
            const user = { name: userNameSpan.innerHTML, role, color };
            userList.push(user);
        }
        return userList;
    }
    addStylesForUsers(calculateUserList(userListElement));
    observeDOM(userListElement, () => {
        addStylesForUsers(calculateUserList(userListElement));
    });
}
// add more buttons here
let buttons = [
    {
        name: "Twitch",
        link: "https://twitch.tv/stegi",
        background: {
            normal: "#6441a5",
            hover: "linear-gradient(#aa1376,#721ca2 40%,#471160)",
        },
    },
];
function addButtons() {
    let navBars = document.getElementsByClassName("navbar-nav");
    if (navBars.length == 0) {
        return siteChanged();
    }
    for (const { name, link, background: { hover, normal }, } of buttons) {
        let buttonElement = document.createElement("li");
        const id = `${name.toLowerCase()}-ref-button`;
        buttonElement.innerHTML = `
<a id="${id}" href="${link}" target="_blank">
	${name}
</a>`;
        navBars[0].appendChild(buttonElement);
        addOrModifyStyles(`
	#${id}{
		background-color: ${normal};
	 }
	
	  #${id}:hover {
		background-image: ${hover};
	 }
`, `${id}-style`);
    }
}
function start() {
    setIcon();
    setBranding();
    // disabled atm
    // attachUserColorListener()
    addButtons();
}
start();
