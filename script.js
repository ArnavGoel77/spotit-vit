function checkAuth() {
    const user = sessionStorage.getItem("vitUser");
    const currentPage = window.location.pathname;

    if (!user) {
        if (!currentPage.includes("index.html") && currentPage !== "/") {
            window.location.href = "index.html";
        }
        return null;
    }

    if (currentPage.includes("index.html") || currentPage === "/") {
        const parsedUser = JSON.parse(user);
        window.location.href = parsedUser.isAdmin ? "admin.html" : "home.html";
        return parsedUser;
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

async function getAllItems() {
    try {
        const snapshot = await db.collection("items").get();
        let items = [];
        snapshot.forEach(doc => {
            items.push(doc.data());
        });

        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        for (let item of items) {
            if (item.status === "open" && (now - item.timestamp > thirtyDaysInMs)) {
                item.status = "expired";
                await updateItemStatus(item.id, "expired");
            }
        }
        return items;
    } catch (error) {
        return [];
    }
}

async function saveItem(item) {
    try {
        await db.collection("items").doc(item.id).set(item);
    } catch (error) {}
}

async function updateItemStatus(itemId, newStatus) {
    try {
        await db.collection("items").doc(itemId).update({ status: newStatus });
    } catch (error) {}
}

async function deleteItem(itemId) {
    try {
        await db.collection("items").doc(itemId).delete();
    } catch (error) {}
}

async function getBannedUsers() {
    try {
        const doc = await db.collection("settings").doc("bannedUsers").get();
        if (doc.exists) return doc.data().emails || [];
        return [];
    } catch (e) { return []; }
}

async function toggleBanUser(email) {
    try {
        let banned = await getBannedUsers();
        if (banned.includes(email)) {
            banned = banned.filter(e => e !== email);
        } else {
            banned.push(email);
        }
        await db.collection("settings").doc("bannedUsers").set({ emails: banned });
    } catch (error) {}
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

    const currentUser = JSON.parse(sessionStorage.getItem("vitUser"));
    const isOwner = currentUser && currentUser.email === item.postedBy;
    let actionArea = "";

    // Security Patch: Hide contact info on the Home page if questions exist
    if (item.type === "found" && !isOwner && item.status === "open") {
        if (item.questions && item.questions.length > 0) {
            actionArea = `<a href="listings.html"><button class="claim-btn" style="width:100%; margin-top:10px;">🔐 Go to 'View All Items' to claim</button></a>`;
        } else {
            actionArea = `<div class="contact-info">📞 Contact: ${item.contact}</div>
                          <div class="contact-info">📦 Item is at: ${item.currentLocation || "N/A"}</div>`;
        }
    } else if (item.type === "found" && isOwner) {
        actionArea = `<div class="contact-info">📞 Your contact: ${item.contact}</div>
                      <div class="contact-info">📦 Item is at: ${item.currentLocation || "N/A"}</div>`;
    } else if (item.type === "lost" && item.status === "open") {
        actionArea = `<div class="contact-info">📞 Contact: ${item.contact}</div>`;
    }

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
                ${actionArea}
            </div>
        </div>
    `;
}

setUserInfo();