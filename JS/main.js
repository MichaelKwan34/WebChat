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

let isDragging = false;

function setupListClick(listItems) {
  listItems.forEach(item => {
    item.addEventListener("click", () => {
      listItems.forEach(li => li.classList.remove("active"));
      item.classList.add("active");

      inactive.style.display = 'none';
      active.style.display = 'flex';
      active.style.flexDirection = 'column';
      activeContactName.textContent = item.textContent
    });
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

setupListClick(friendListItems);
setupListClick(groupListItems);

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
