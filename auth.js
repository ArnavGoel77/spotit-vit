const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const allowedDomains = ["vitstudent.ac.in", "vit.ac.in"];

const ADMIN_EMAILS = [
    "goelarnav06@gmail.com",
    "mehergandhok@gmail.com",
    "athishraj04@gmail.com"
];

function isVITemail(email) {
    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
}

function isAdmin(email) {
    return ADMIN_EMAILS.includes(email);
}

document.getElementById("googleLoginBtn").addEventListener("click", function () {
    auth.signInWithPopup(provider)
        .then(async (result) => {
            const user = result.user;
            
            const bannedUsers = await getBannedUsers();
            if (bannedUsers.includes(user.email)) {
                auth.signOut();
                showError("Your account has been suspended by an administrator.");
                return;
            }

            if (isAdmin(user.email)) {
                sessionStorage.setItem("vitUser", JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    isAdmin: true
                }));
                window.location.href = "admin.html";
                return;
            }

            if (isVITemail(user.email)) {
                sessionStorage.setItem("vitUser", JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    isAdmin: false
                }));
                window.location.href = "home.html";
            } else {
                auth.signOut();
                showError("Access denied! Only @vitstudent.ac.in and @vit.ac.in emails are allowed.");
            }
        })
        .catch((error) => {
            if (error.code !== "auth/popup-closed-by-user") {
                showError("Login failed. Please try again.");
            }
        });
});

function showError(msg) {
    const errDiv = document.getElementById("errorMsg");
    errDiv.textContent = msg;
    errDiv.style.display = "block";
}