document.addEventListener("DOMContentLoaded", function() {
    const email = localStorage.getItem("userEmail");
    if (email) {
        document.getElementById("userEmail").textContent = email;
    }
});