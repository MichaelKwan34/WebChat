export default function SidebarNav({ activeTab, setActiveTab }) {
  return (
    <nav>
      <ul>
        <li className={activeTab === "friends" ? "list-active" : "list"} onClick={() => setActiveTab("friends")}>
          <a>
            <span className="icon" id="person-icon">
              <ion-icon name="person-circle"></ion-icon>
            </span>
          </a>
        </li>

        <li className={activeTab === "chats" ? "list-active" : "list"} onClick={() => setActiveTab("chats")}>
          <a>
            <span className="icon" id="chatbubbles-icon">
              <ion-icon name="chatbubbles"></ion-icon>
            </span>
          </a>
        </li>

        <li className={activeTab === "add" ? "list-active" : "list"} onClick={() => setActiveTab("add")}>
          <a>
            <span className="icon">
              <ion-icon name="person-add"></ion-icon>
            </span>
          </a>
        </li>

        <li className={activeTab === "settings" ? "list-active" : "list"} onClick={() => setActiveTab("settings")}>
          <a>
            <span className="icon">
              <ion-icon name="settings-sharp"></ion-icon>
            </span>
          </a>
        </li>
      </ul>
    </nav>
  );
}