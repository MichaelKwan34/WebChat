export default function SidebarHeader({ activeTab, currentSearch, setFriendsSearch, setChatsSearch}) {
  const titles = {
    friends: "Friends",
    chats: "Chats",
    add: "Add Contact",
    settings: "Settings",
  };

  const handleChange = (e) => {
    const value = e.target.value.toLowerCase();
    if (activeTab === "friends") setFriendsSearch(value);
    if (activeTab === "chats") setChatsSearch(value);
  };

  return (
    <div className="left-side-header">
      <h2>{titles[activeTab]}</h2>

      {(activeTab === "friends" || activeTab === "chats") && (
        <div className="search-wrapper">
          <ion-icon name="search-outline" id="search-icon"/>
          <input type="text" autoComplete="off" placeholder="Search" value={currentSearch} onChange={handleChange}/>
        </div>
      )}
    </div>
  );
}