import { showToast } from "./toast.js";

const leftSide = document.querySelector('.left-side');
const friendList = document.getElementById("friend-lists");
const friendListItems = document.querySelectorAll("#friend-lists li");
const navItems = document.querySelectorAll("nav ul li")
const divider = document.querySelector('.divider');
const inactive = document.querySelector('.inactive-view')
const active = document.querySelector('.active-view')

const leftHeaderText = document.getElementById("sidebar-header");
const groupList = document.getElementById("group-lists");
const groupListItems = document.querySelectorAll("#group-lists li");
const searchWrapper = document.querySelector('.search-wrapper');

const leftSideHeader = document.querySelector(".left-side-header");

const activeContactName = document.getElementById("contact-name-active");

const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");

const messagesContainer = document.querySelector(".active-view .messages");

let isDragging = false;

let currentUser;

// JWT Token
const token = localStorage.getItem("token");
if (!token) {
  window.location.replace = "/frontend/login.html"
} else {
  const payload = JSON.parse(atob(token.split(".")[1]));
  currentUser = payload.username

  // Display "successfully logged in" message 
  document.addEventListener("DOMContentLoaded", () => {
    showToast("Logged in successfully!", "success");
    loadFriends();
    loadGroups();
  });
}

function filterLists() {
  const query = searchInput.value.toLowerCase();
  
  let activeListItems = [];

  if (friendList.style.display !== 'none') {
    activeListItems = friendListItems;
  } 
  else if (groupList.style.display !== 'none') {
    activeListItems = groupListItems;
  }

  activeListItems.forEach(item => {
    const text = item.textContent.toLowerCase()
    if (text.includes(query)) {
      item.style.display = '';
    }
    else {
      item.style.display = 'none';
    }
  });
}

// Divider
divider.addEventListener('mousedown', () => {
    isDragging = true;
    document.body.style.cursor = 'col-resize';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newWidth = e.clientX;
    if (newWidth >= 250 && newWidth <= 1200) {
        leftSide.style.width = newWidth + 'px';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = 'default';
});

// navItems
navItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    navItems.forEach(li => li.classList.remove("list-active"))
    item.classList.add("list-active")

    if(index === 0) {
      leftHeaderText.textContent = 'Friends';
      friendList.style.display = 'block';
      groupList.style.display = 'none';
      
    }
    else if (index === 1) {
      leftHeaderText.textContent = 'Groups';
      friendList.style.display = 'none';
      groupList.style.display = 'block';
    }
    else if (index === 2) {
      leftHeaderText.textContent = 'Add Contact';
      logoutBtn.style.display = 'none';
    }
    else {
      leftHeaderText.textContent = 'Settings';
      logoutBtn.style.display = 'block';
    }

    if (index === 0 || index === 1) {
      searchWrapper.style.display = '';
      leftSideHeader.style.borderBottom = '';
      leftSideHeader.style.paddingBottom = '0px';
      logoutBtn.style.display = 'none';
    }
    else {
      friendList.style.display = 'none';
      groupList.style.display = 'none';
      searchWrapper.style.display = 'none';
      leftSideHeader.style.borderBottom = '2px solid rgba(255,255,255,0.3)';
    }
  })
})

searchInput.addEventListener('input', filterLists);

const messages = document.querySelector('.messages');
let isScrolling;
messages.addEventListener('scroll', () => {
  messages.classList.add('scrolling');
  window.clearTimeout(isScrolling);
  isScrolling = setTimeout(() => {
    messages.classList.remove('scrolling');
  }, 1000);
});

// Display list of Friends
async function loadFriends() {
  try {
    const res = await fetch(`http://localhost:3000/users/${currentUser}/friends`)

    if (!res.ok) {
      throw new Error("Failed to fetch friends");
    }

    const data = await res.json();
    
    friendList.innerHTML = "";

    data.friends.forEach(friend => {
      const li = document.createElement("li");
      li.textContent = friend;

      li.addEventListener("click", async () => {
        friendListItems.forEach(li => li.classList.remove("active"));
        li.classList.add("active");

        inactive.style.display = "none";
        active.style.display = "flex";
        active.style.flexDirection = "column";
        activeContactName.textContent = friend;

        try {
          const res = await fetch(`http://localhost:3000/conversations/${currentUser}/${friend}`);
          const data = await res.json();
          const conversationId = data.conversationId;
          loadMessages(conversationId);
        } catch (err) {
          showToast("Failed to load conversation", "error");
        }
      });

      friendList.appendChild(li);
    });

  } catch (err) {
      showToast("Failed to load friends", "error");
  }
}

// Display list of Groups
async function loadGroups() {
  try {
    const res = await fetch(`http://localhost:3000/users/${currentUser}/groups`)

    if (!res.ok) {
      throw new Error("Failed to fetch friends");
    }

    const data = await res.json();
    
    groupList.innerHTML = "";

    data.friends.forEach(group => {
      const li = document.createElement("li");
      li.textContent = group;

      li.addEventListener("click", () => {
        groupListItems.forEach(li => li.classList.remove("active"));
        li.classList.add("active");

        inactive.style.display = "none";
        active.style.display = "flex";
        active.style.flexDirection = "column";
        activeContactName.textContent = group;
      });

      groupList.appendChild(li);
    });

  } catch (err) {
      showToast("Failed to load groups", "error");
  }
}

// Display messages for selected contact
async function loadMessages(conversationId) {
  const res = await fetch (`http://localhost:3000/messages/${conversationId}`);
  const messages = await res.json();

  messagesContainer.innerHTML = "";

  messages.forEach(msg => {
    const messageClass = msg.sender === currentUser ? "sent" : "received";

    // Create message div
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${messageClass}`;

    // Message content
    const content = document.createElement("p");
    content.className = "message-content";
    content.textContent = msg.text;

    // Message time
    // const time = document.createElement("span");
    // time.className = "message-time";
    // time.textContent = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    messageDiv.appendChild(content);
    // messageDiv.appendChild(time);

    messagesContainer.appendChild(messageDiv);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}