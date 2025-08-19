document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("SCRIPT FILE CALLED - ADMINLOG");
        
        const pass = document.getElementById("password").value;
        const uname = document.getElementById("username").value;
        try {
            const response = await fetch("http://localhost:3000/adminlogin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ Username: uname, Password: pass })
            });

            const data = await response.json();


            localStorage.setItem("AdminUsername", data.username);


            if (response.ok) {
                document.getElementById("username").value = "";
                document.getElementById("password").value = "";
                alert(`${uname} Logged Successfully`);
                window.location.href = "Admin/mains2.html";
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.log(err)
        }
    })
})