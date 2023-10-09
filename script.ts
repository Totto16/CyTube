function siteChanged(): never {
	throw new Error(
		"An Error occurred, the site changed, please contact the developers of this script to modify it!"
	)
}

function setIcon(): void {
	const div: HTMLDivElement = document.createElement("div")
	div.innerHTML =
		'<link rel="icon" type="image/x-icon" href="https://yt3.googleusercontent.com/ytc/APkrFKaZ1POoLFYwBP_7riSuRQgp53v1j-Biw68QR4ay=s900-c-k-c0x00ffffff-no-rj">'
	if (div.firstChild === null) {
		return siteChanged()
	}
	document.head.appendChild(div.firstChild)
}

function setBranding(): void {
	const div: HTMLDivElement = document.createElement("div")
	div.innerHTML =
		'<a class="navbar-brand" href="https://twitch.tv/stegi">stegiTube</a>'

	const navBars = document.getElementsByClassName("navbar-brand")
	if (div.firstChild === null || navBars.length == 0) {
		return siteChanged()
	}

	navBars[0].replaceWith(div.firstChild)
}

type Role = "op" | "owner" | "guest" | "normal"

type RoleMapping = {
	[key in Role]: string | null
}

let roleMappings: RoleMapping = {
	op: "userlist_op",
	owner: "userlist_owner",
	guest: "userlist_guest",
	normal: null,
}

let NULLTOKEN = "__NULL__" as const

type ReversedRoleMapping = {
	[key in string]: Role | undefined
} & {
	[key in typeof NULLTOKEN]: Role
}

let reversedRoleMapping: ReversedRoleMapping = (() => {
	return Object.fromEntries(
		(Object.entries(roleMappings) as Array<[Role, string | null]>).map(
			([role, clazz]) => {
				if (clazz === null) {
					return [NULLTOKEN, role]
				}

				return [clazz, role]
			}
		)
	) as ReversedRoleMapping
})()

function roleToClassName(role: Role): string | null {
	return roleMappings[role]
}

function getRoleByClassList(list: DOMTokenList): Role {
	if (list.length === 0) {
		return reversedRoleMapping[NULLTOKEN]
	}

	for (const clazz of Array.from(list)) {
		const mappedRole: Role | undefined = reversedRoleMapping[clazz]
		if (mappedRole !== undefined) {
			return mappedRole
		}
	}

	// log an error and return the default user
	console.error(
		new Error(
			`Couldn't find role by classList with classes: ${list}\nThis is the fault of the developer, by not adding all available user to the correct mapping!`
		)
	)
	return reversedRoleMapping[NULLTOKEN]
}

interface User {
	name: string
	role: Role
	color: string
}

function addOrModifyStyles(styles: string, id: string) {
	const head = document.head ?? document.getElementsByTagName("head")[0]

	const isPresent = document.getElementById(id) !== null

	let styleElement: HTMLStyleElement
	if (isPresent) {
		styleElement = document.getElementById(id) as HTMLStyleElement
	} else {
		styleElement = document.createElement("style")
		styleElement.id = id
		styleElement.type = "text/css"
		head.appendChild(styleElement)
	}

	styleElement.innerHTML = styles
}

function addStylesForUsers(userList: User[]) {
	let styles = ""

	for (const { name, color } of userList) {
		styles += `
.chat-msg-${name} .username {
    color:${color} !important;
}
`
	}

	addOrModifyStyles(styles, "usernames-styles-custom-id")
}

// from: https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
let observeDOM = (() => {
	const MutationObserver =
		window.MutationObserver ??
		((window as any).WebKitMutationObserver as MutationObserver | null)

	return function (obj: Node, callback: (...args: any) => void) {
		if (!obj || obj.nodeType !== 1) return

		if (MutationObserver) {
			// define a new observer
			const mutationObserver = new MutationObserver(callback)

			// have the observer observe for changes in children
			mutationObserver.observe(obj, { childList: true, subtree: true })
			return mutationObserver
		}

		// browser support fallback
		else if (window.addEventListener as null | any) {
			obj.addEventListener("DOMNodeInserted", callback, false)
			obj.addEventListener("DOMNodeRemoved", callback, false)
		}
	}
})()

// this colors users according to their role color!
function attachUserColorListener(): void {
	const userListElement = document.getElementById("userlist")

	if (userListElement === null) {
		return siteChanged()
	}

	function calculateUserList(elem: HTMLElement) {
		const userList: User[] = []

		for (let i = 0; i < elem.children.length; ++i) {
			const child = elem.children.item(i) as Element
			const userNameSpan = child.children[1]
			const role: Role = getRoleByClassList(userNameSpan.classList)
			const color = getComputedStyle(userNameSpan).color
			const user = { name: userNameSpan.innerHTML, role, color }
			userList.push(user)
		}

		return userList
	}

	addStylesForUsers(calculateUserList(userListElement))

	observeDOM(userListElement, () => {
		addStylesForUsers(calculateUserList(userListElement))
	})
}

interface Button {
	name: string
	link: string
	background: {
		normal: string
		hover: string
	}
}

// add more buttons here
let buttons: Button[] = [
	{
		name: "Twitch",
		link: "https://twitch.tv/stegi",
		background: {
			normal: "#6441a5",
			hover: "linear-gradient(#6441a5,#471160 50%,#6441a5) ",
		},
	},
	{
		name: "StegiShorts",
		link: "https://www.youtube.com/@StegiShorts",
		background: {
			normal: "#b81414",
			hover: "linear-gradient(#ec5353,#a51b0b 50%,#ff0000)",
		},
	},
	{
		name: "StegiTrash",
		link: "https://www.youtube.com/@StegiTrash",
		background: {
			normal: "#b81414",
			hover: "linear-gradient(#ec5353,#a51b0b 50%,#ff0000)",
		},
	},
]

function addButtons() {
	let navBars = document.getElementsByClassName("navbar-nav")

	if (navBars.length == 0) {
		return siteChanged()
	}

	for (const {
		name,
		link,
		background: { hover, normal },
	} of buttons) {
		let buttonElement = document.createElement("li")

		const id = `${name.toLowerCase()}-ref-button`

		buttonElement.innerHTML = `
<a id="${id}" href="${link}" target="_blank">
	${name}
</a>`

		navBars[0].appendChild(buttonElement)

		addOrModifyStyles(
			`
	#${id}{
		background-color: ${normal};
	 }
	
	  #${id}:hover {
		background-image: ${hover};
	 }
`,
			`${id}-style`
		)
	}
}

function start() {
	setIcon()
	setBranding()

	// disabled atm
	// attachUserColorListener()
	addButtons()
}

start()
