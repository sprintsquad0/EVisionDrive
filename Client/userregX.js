document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm").addEventListener("submit", async(event) => {
        event.preventDefault();
        const pass = document.getElementById("password").value;
        const uname = document.getElementById("username").value;
        const phone = document.getElementById("tel").value;
        const mail = document.getElementById("mail").value;
        const names = document.getElementById("names").value;

        try {
            const response = await fetch("http://localhost:3000/userreg", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ Name: names, Username: uname, Password: pass, Mail: mail, Phone: phone })
            });

            const data = await response.json();
            localStorage.setItem("userUsername", data.username);

            if (response.ok) {
                document.getElementById("username").value = "";
                document.getElementById("password").value = "";
                document.getElementById("tel").value = "";
                document.getElementById("mail").value = "";
                document.getElementById("names").value = "";
                alert(`${uname} Saved Successfully`);
                window.location.href = "User/mains2.html";
            }
        } catch (err) {
            console.log(err);
        }
    });
});
