<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking</title>
  <style>
    body {
      background: linear-gradient(120deg, #0f172a, #1e293b);
      font-family: 'Poppins', Arial, sans-serif;
      color: #fff;
      padding: 20px;
      text-align: center;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    h2 {
      color: #4caf50;
      font-size: 2.5em;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    form {
      background: rgba(0, 0, 0, 0.7);
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
      width: 400px;
      max-width: 100%;
    }

    label {
      color: #a5f3fc;
      font-size: 1em;
      text-align: left;
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input,
    select {
      width: calc(100% - 16px);
      margin-bottom: 15px;
      padding: 10px;
      border: none;
      border-radius: 5px;
      outline: none;
      font-size: 1em;
      background-color: #1e293b;
      color: #fff;
      transition: all 0.3s ease;
    }

    .co:focus,
    select:focus {
      box-shadow: 0 0 8px #4caf50;
    }

    ::placeholder {
      color: #a5f3fc;
      opacity: 0.8;
    }

    #otp-btn {
      width: 100%;
      padding: 10px;
      background-color: green;
      border: none;
      border-radius: 5px;
      font-size: 1em;
      color: white;
      cursor: pointer;
    }

    #otp-btn:hover {
      box-shadow: 0 0 10px rgba(6, 185, 230, 0.7);
    }

    #sub {
      background-color: green;
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 5px;
      font-size: 1em;
      color: white;
      cursor: pointer;
    }

    #sub:hover {
      box-shadow: 0 0 10px rgba(6, 185, 230, 0.7);
    }

    #timer {
      margin-top: 10px;
      color: #a5f3fc;
      font-size: 0.9em;
    }
  </style>
</head>

<body>
  <h2>Book Your Slot</h2>
  <form action="#">
    <label for="name">Name</label>
    <input type="text" class="co" placeholder="Enter Your Name" required />

    <label for="mobile">Mobile No</label>
    <input type="text" class="co" placeholder="Enter Your Number" required />

    <label for="vehicle">Vehicle No</label>
    <input type="text" class="co" placeholder="Enter Vehicle No" required />

    <label for="stationid">Station Id</label>
    <input type="text" class="co" placeholder="Enter Station Id" required />

    <label for="date">Booking Date</label>
    <input type="date" class="co" id="booking-date" required />


    <label for="slot">Timing Slots</label>
    <select required id="slot-dropdown">

    </select>

    <!-- Send OTP Section -->
    <div id="otp-section">
      <button type="button" id="otp-btn" onclick="startOtpTimer()">SEND OTP</button>
      <div id="timer"></div>
    </div>

    <!-- OTP Input + Submit Section -->
    <div id="otp-input-section" style="display: none;">
      <label for="otp">Enter OTP</label>
      <input type="text" class="co" id="otp-value" placeholder="Enter Your OTP" required />
      <input type="submit" id="sub" value="Book Slot" />
    </div>
  </form>

  <script>
    let countdown;

    // Fetch available slots when date changes
    document.getElementById("booking-date").addEventListener("change", fetchAvailableSlots);

    async function fetchAvailableSlots() {
      const date = document.getElementById("booking-date").value;
      const stationId = document.querySelectorAll(".co")[3].value.trim();
      const slotDropdown = document.getElementById("slot-dropdown");

      if (!date || !stationId) return;

      try {
        const res = await fetch(`http://localhost:3000/api/available-slots?stationId=${stationId}&date=${date}`);
        const data = await res.json();

        const allSlots = [
          "10:00 AM ~ 11:00 AM",
          "11:00 AM ~ 12:00 PM",
          "12:00 PM ~ 01:00 PM",
          "01:00 PM ~ 02:00 PM"
        ];

        slotDropdown.innerHTML = `<option disabled selected>Choose Your Slot...!</option>`;

        const now = new Date();
        const today = new Date().toISOString().split("T")[0];
        const day = today.split("-")[2]
        const year = today.split("-")[0]
        const month = today.split("-")[1]

        allSlots.forEach(slot => {
          const slotHour = parseInt(slot.split(":")[0]);
          const isPM = slot.includes("PM");
          const slot24 = isPM ? (slotHour === 12 ? 12 : slotHour + 12) : (slotHour === 12 ? 0 : slotHour);

          const selectedDate = new Date(date);
          const currentDate = new Date();

          const isToday = selectedDate.toDateString() === currentDate.toDateString();
          const isPast = selectedDate < currentDate.setHours(0, 0, 0, 0); // ignore time portion

          if (isPast) return;

          if (isToday && slot24 <= currentDate.getHours()) return;

          const option = document.createElement("option");
          option.value = slot;
          option.textContent = data.availableSlots.includes(slot) ? slot : `${slot} (Booked)`;
          option.disabled = !data.availableSlots.includes(slot);
          slotDropdown.appendChild(option);
        });


      } catch (err) {
        console.error("Error fetching slots", err);
        alert("Failed to load slots");
      }
    }


    function startOtpTimer() {
      const otpBtn = document.getElementById("otp-btn");
      const timer = document.getElementById("timer");
      const otpSection = document.getElementById("otp-input-section");

      let timeLeft = 60;

      // Show OTP input + Book button
      otpSection.style.display = "block";
      otpBtn.disabled = true;
      timer.textContent = `You have ${timeLeft}s to enter OTP`;
      otpBtn.style.display = "none"
      // Start timer
      countdown = setInterval(() => {
        timeLeft--;
        timer.textContent = `You have ${timeLeft}s to enter OTP`;

        if (timeLeft <= 0) {
          clearInterval(countdown);
          otpBtn.style.display = "block"
          // After 5 seconds, hide OTP input + submit
          otpSection.style.display = "none";

          // Enable resend OTP
          otpBtn.disabled = false;
          timer.textContent = "Time's up! Please resend OTP.";
        }
      }, 1000);
    }


    //**********************************************//

    const form = document.querySelector("form");
    const otpBtn = document.getElementById("otp-btn");
    const otpInput = document.getElementById("otp-value");

    otpBtn.addEventListener("click", async () => {
      const phoneInput = document.querySelectorAll(".co")[1];
      let phone = phoneInput.value.trim();

      if (!phone || phone.length < 10) {
        alert("Please enter a valid mobile number");
        return;
      }

      if (phone.length === 10 && !phone.startsWith('+')) {
        phone = '+91' + phone;
      }

      try {
        const res = await fetch("http://localhost:3000/call-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: phone }),
        });

        const msg = await res.text();
        alert(msg);
      } catch (err) {
        console.error(err);
        alert("Failed to send OTP");
      }
    });


    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.querySelectorAll(".co")[0].value.trim();
      const phone = document.querySelectorAll(".co")[1].value.trim();
      const vehicleNumber = document.querySelectorAll(".co")[2].value.trim();
      const slot = document.querySelector("select").value;
      const otp = otpInput.value.trim();
      const stationId = document.querySelectorAll(".co")[3].value.trim();

      if (!name || !phone || !vehicleNumber || !slot || !otp) {
        alert("Please fill in all fields and enter OTP");
        return;
      }

      const bookingData = {
        name,
        phone,
        vehicleNumber, // if you're treating this as stationId
        date: new Date().toISOString().split("T")[0],
        slot,
        otp,
        stationId
      };

      try {
        const res = await fetch("http://localhost:3000/api/book-slot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        });

        const result = await res.json();

        if (res.ok) {
          alert("✅ " + result.message);
          form.reset();
          document.getElementById("otp-input-section").style.display = "none";
          document.getElementById("otp-btn").disabled = false;
        } else {
          alert("❌ " + result.message);
        }
      } catch (err) {
        console.error(err);
        alert("Booking failed. Please try again.");
      }
    });

  </script>
</body>

</html>
