import { showToast } from "./toast.js";

const leftSide = document.querySelector('.left-side');
const friendList = document.getElementById("friend-lists");
const friendListItems = document.querySelectorAll("#friend-lists li");
const navItems = document.querySelectorAll("nav ul li");
const divider = document.querySelector('.divider');
const inactive = document.querySelector('.inactive-view');
const active = document.querySelector('.active-view');

const leftHeaderText = document.getElementById("sidebar-header");
const chatList = document.getElementById("chat-lists");
const chatListItems = document.querySelectorAll("#chat-lists li");
const searchWrapper = document.querySelector('.search-wrapper');

const leftSideHeader = document.querySelector(".left-side-header");

const activeContactName = document.getElementById("contact-name-active");

const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");

const messagesContainer = document.querySelector(".active-view .messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const addContactContainer = document.querySelector('.add-contact-container');
const searchContactInput = document.getElementById("searchContactInput");
const searchInfo = document.getElementById("searchInfo");
const addOrMessage = document.querySelector(".add-or-message");
const addContact = document.getElementById("addContact");
const messageContact = document.getElementById("messageContact");

let isDragging = false;

let currentUser;
let activeMessageName;
let contactSearched;

// JWT Token
const token = localStorage.getItem("token");
if (!token) {
  // window.location.replace = "/frontend/login.html"
} else {
  const payload = JSON.parse(atob(token.split(".")[1]));
  currentUser = payload.username

  // Display "successfully logged in" message 
  document.addEventListener("DOMContentLoaded", () => {
    showToast("Logged in successfully!", "success");
    loadFriends();
    loadChats();
  });
}

function filterLists() {
  const query = searchInput.value.toLowerCase();
  
  let activeListItems = [];

  if (friendList.style.display !== 'none') {
    document.querySelectorAll("#friend-lists li").forEach(li => activeListItems.push(li));
  } 
  else if (chatList.style.display !== 'none') {
    document.querySelectorAll("#chat-lists li").forEach(li => activeListItems.push(li));
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
      chatList.style.display = 'none';
      addContactContainer.style.display = 'none';
    }
    else if (index === 1) {
      leftHeaderText.textContent = 'Chats';
      friendList.style.display = 'none';
      chatList.style.display = 'block';
      addContactContainer.style.display = 'none';
    }
    else if (index === 2) {
      leftHeaderText.textContent = 'Add Contact';
      addContactContainer.style.display = 'flex';
      logoutBtn.style.display = 'none';
    }
    else {
      leftHeaderText.textContent = 'Settings';
      logoutBtn.style.display = 'block';
      addContactContainer.style.display = 'none';
    }

    if (index === 0 || index === 1) {
      searchWrapper.style.display = '';
      leftSideHeader.style.borderBottom = '';
      leftSideHeader.style.paddingBottom = '0px';
      logoutBtn.style.display = 'none';
    }
    else {
      friendList.style.display = 'none';
      chatList.style.display = 'none';
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

      if (friend === activeMessageName) li.classList.add("active");

      li.addEventListener("click", async () => {
        activeMessageName = friend;
        document.querySelectorAll("#friend-lists li").forEach(li => { li.classList.toggle("active", li.textContent === activeMessageName) });
        document.querySelectorAll("#chat-lists li").forEach(li => { li.classList.toggle("active", li.textContent === activeMessageName) });
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
          console.log("Failed to load conversation")
          // showToast("Failed to load conversation", "error");
        }
      });

      friendList.appendChild(li);
    });

  } catch (err) {
      showToast("Failed to load friends", "error");
  }
}

// Display list of Chats
async function loadChats() {
  try {
    const res = await fetch(`http://localhost:3000/users/${currentUser}/chats`)

    if (!res.ok) {
      throw new Error("Failed to fetch friends");
    }

    const data = await res.json();
    
    chatList.innerHTML = "";

    data.friends.forEach(chat => {
      const li = document.createElement("li");
      li.textContent = chat;

      if (chat === activeMessageName) li.classList.add("active");

      li.addEventListener("click", async () => {
        activeMessageName = chat;
        document.querySelectorAll("#friend-lists li").forEach(li => { li.classList.toggle("active", li.textContent === activeMessageName) });
        document.querySelectorAll("#chat-lists li").forEach(li => { li.classList.toggle("active", li.textContent === activeMessageName) });
        li.classList.add("active");

        inactive.style.display = "none";
        active.style.display = "flex";
        active.style.flexDirection = "column";
        activeContactName.textContent = chat;

         try {
          const res = await fetch(`http://localhost:3000/conversations/${currentUser}/${chat}`);
          const data = await res.json();
          const conversationId = data.conversationId;
          loadMessages(conversationId);
        } catch (err) {
          console.log(err)
          // showToast("Failed to load conversation", "error");
        }

      });

      chatList.appendChild(li);
    });

  } catch (err) {
      showToast("Failed to load chats", "error");
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
    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    messageDiv.appendChild(content);
    messageDiv.appendChild(time);

    messagesContainer.appendChild(messageDiv);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Push a message to DB
async function sendMessage(msg) {
  try {
    let res = await fetch (`http://localhost:3000/conversations/${currentUser}/${activeMessageName}`);
    let data = await res.json();
    const conversationId = data.conversationId;

    res = await fetch(`http://localhost:3000/messages/${conversationId}`, {
      method: "POST",
      headers: { 
        "Content-Type" : "application/json",
      },
      body: JSON.stringify({
        sender: currentUser,
        msg: msg,
        receiver: activeMessageName
      })
    });

    data = await res.json();

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message);
    }
    messageInput.value = '';

    const messageClass = "sent";

    // Create message div
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${messageClass}`;

    // Message content
    const content = document.createElement("p");
    content.className = "message-content";
    content.textContent = msg;

    // Message time
    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = new Date(data.timeSent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(content);
    messageDiv.appendChild(time);

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    loadChats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && messageInput.value !== '') {
    sendButton.click();
  }
});

sendButton.addEventListener('click', () => {
  sendMessage(messageInput.value)
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem("token")
  window.location.replace("/frontend/login.html")
});

searchContactInput.addEventListener("keydown", async (event) => {
  const username = searchContactInput.value.trim();
  if (event.key === "Enter" && username !== '') {
    const res = await fetch (`http://localhost:3000/users/find-user/${currentUser}/${username}`);
    const data = await res.json();
    
    if (data.exists) {
      if (data.user.friends.includes(username)) {
        searchInfo.textContent = `'${data.searchedUser}' is already your friend`;
        searchInfo.className = "found";
        addOrMessage.style.visibility = "visible";
        addContact.style.display = "none";
        contactSearched = username;
      }
      else if (data.searchedUser === currentUser) {
        searchInfo.textContent = "You can't add youself";
        searchInfo.className = "";
        addOrMessage.style.visibility = "hidden";
      }
      else if (data.searchedUser !== currentUser) {
        searchInfo.textContent = `Found: ${username}`;
        searchInfo.className = "found";
        addOrMessage.style.visibility = "visible";
        addContact.style.display = "";
        contactSearched = username;
      }
    } else {
        searchInfo.textContent = `User not found`;
        searchInfo.className = "not-found";
        addOrMessage.style.visibility = "hidden";
    }
    searchInfo.style.visibility = "visible";
  }
});

searchContactInput.addEventListener("input", () => {
  if (searchContactInput.value.trim() === '') {
    searchInfo.textContent = "information";
    searchInfo.style.visibility = "hidden";
    searchInfo.className = "";
    addOrMessage.style.visibility = "hidden";
  }
});

addContact.addEventListener("click", async () => {
  const res = await fetch(`http://localhost:3000/add-contact/${currentUser}/${contactSearched}`, {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({contactSearched})
  });
  const data = await res.json();

  if (data.success) {
    showToast(data.message, "success");
    searchInfo.textContent = `'${contactSearched}' is already your friend`;
    addContact.style.display = "none";
    loadFriends()
  }
});

messageContact.addEventListener("click", async () => {
  activeMessageName = contactSearched;
  document.querySelectorAll("#friend-lists li").forEach(li => { li.classList.toggle("active", li.textContent === activeMessageName) });
  document.querySelectorAll("#chat-lists li").forEach(li => { li.classList.toggle("active", li.textContent === activeMessageName) });
  inactive.style.display = "none";
  active.style.display = "flex";
  active.style.flexDirection = "column";
  activeContactName.textContent = contactSearched;

   try {
    const res = await fetch(`http://localhost:3000/conversations/${currentUser}/${contactSearched}`);
    const data = await res.json();
    const conversationId = data.conversationId;
    loadMessages(conversationId);
  } catch (err) {
    console.log("Failed to load conversation")
    // showToast("Failed to load conversation", "error");
  }

});