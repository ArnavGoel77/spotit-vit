function checkAuth() {
    const user = sessionStorage.getItem("vitUser");
    if (!user) {
        window.location.href = "index.html";
        return null;
    }
    return JSON.parse(user);
}

function logout() {
    firebase.auth().signOut().then(() => {
        sessionStorage.removeItem("vitUser");
        window.location.href = "index.html";
    });
}

function setUserInfo() {
    const user = checkAuth();
    if (!user) return;
    const el = document.getElementById("userName");
    if (el) {
        const firstName = user.name.split(" ")[0];
        el.textContent = "Hi, " + firstName;
    }
}

function getAllItems() {
    const data = localStorage.getItem("vitLostFoundItems");
    if (!data) return [];
    
    let items = JSON.parse(data);
    let modified = false;
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    items.forEach(item => {
        if (item.status === "open" && (now - item.timestamp > thirtyDaysInMs)) {
            item.status = "expired";
            modified = true;
        }
    });

    if (modified) {
        localStorage.setItem("vitLostFoundItems", JSON.stringify(items));
    }

    return items;
}

function saveItem(item) {
    const items = getAllItems();
    items.push(item);
    localStorage.setItem("vitLostFoundItems", JSON.stringify(items));
}

function updateItemStatus(itemId, newStatus) {
    const items = getAllItems();
    const idx = items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
        items[idx].status = newStatus;
        localStorage.setItem("vitLostFoundItems", JSON.stringify(items));
    }
}

function generateId() {
    return "item_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function buildItemCard(item) {
    const desc = item.description.length > 90
        ? item.description.substring(0, 90) + "..."
        : item.description;

    return `
        <div class="item-card">
            <div class="card-top ${item.type}">
                <span class="type-badge">${item.type === "lost" ? "🔍 LOST" : "✅ FOUND"}</span>
                <span class="status-badge ${item.status}">${item.status.toUpperCase()}</span>
            </div>
            <div class="card-body">
                <h4 class="card-title">${item.title}</h4>
                <p class="card-desc">${desc}</p>
                <div class="card-meta">
                    <span>📍 ${item.location}</span>
                    <span>📅 ${formatDate(item.date)}</span>
                </div>
                <div class="card-footer">
                    <span class="cat-tag">${item.category}</span>
                    <span class="posted-by">by ${item.postedByName.split(" ")[0]}</span>
                </div>
                ${item.status === "open" ? `<div class="contact-info">📞 Contact: ${item.contact}</div>` : ""}
            </div>
        </div>
    `;
}

setUserInfo();