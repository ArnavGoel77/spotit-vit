const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const allowedDomains = ["vitstudent.ac.in", "vit.ac.in"];

const ADMIN_EMAILS = ["goelarnav06@gmail.com","mehergandhok@gmail.com","athishraj04@gmail.com"];

function isVITemail(email) {
    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
}

function isAdmin(email) {
    return ADMIN_EMAILS.includes(email);
}

document.getElementById("googleLoginBtn").addEventListener("click", function () {

    // ---- BYPASS FOR PRESENTATION - comment this block out to restore real auth ----
    // sessionStorage.setItem("vitUser", JSON.stringify({
    //     name: "Arnav Goel",
    //     email: "test@vitstudent.ac.in",
    //     photo: ""
    // }));
    // window.location.href = "home.html";
    // return;
    // ---- END BYPASS ----

    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;

            // check admin first - admin email bypasses VIT domain check
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
                // store basic user info so other pages can use it
                sessionStorage.setItem("vitUser", JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    isAdmin: false
                }));
                window.location.href = "home.html";
            } else {
                // not a vit email and not admin, kick them out
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