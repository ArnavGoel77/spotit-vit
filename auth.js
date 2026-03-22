const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const allowedDomains = ["vitstudent.ac.in", "vit.ac.in"];

function isVITemail(email) {
    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
}

document.getElementById("googleLoginBtn").addEventListener("click", function () {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;

            if (isVITemail(user.email)) {
                // store basic user info so other pages can use it
                sessionStorage.setItem("vitUser", JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL
                }));
                window.location.href = "home.html";
            } else {
                // not a vit email, kick them out
                auth.signOut();
                showError("Access denied! Only @vitstudent.ac.in and @vit.ac.in emails are allowed.");
            }
        })
        .catch((error) => {
            // popup closed or something went wrong
            if (error.code !== "auth/popup-closed-by-user") {
                showError("Login failed. Please try again.");
            }
            console.error(error);
        });
});

function showError(msg) {
    const errDiv = document.getElementById("errorMsg");
    errDiv.textContent = msg;
    errDiv.style.display = "block";
}