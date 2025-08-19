<<<<<<< HEAD
//const mongoose = require("mongoose");
//const express = require("express");
//const bcrypt = require("bcryptjs");
//const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
//const cors = require("cors")
import { fileURLToPath } from 'url';
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import path from "path";
app.use(cors({ origin: "http://127.0.0.1:5500" }));
import twilio from "twilio"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

mongoose
  .connect("mongodb+srv://deepcoders0:ewGQpK7TFo40ITVN@deepviber03.vlc9q.mongodb.net/EV_RECHARGE")////newdb
  .then(() => {
    console.log("CONNECTED SUCCESSFULLY");
  })
  .catch((err) => {
    console.log(err);
  });

const schema = new mongoose.Schema({
  Username: { type: String, unique: true, required: true },
  Password: { type: String, required: function () { return this.isAdmin !== true } },
  isAdmin: { type: Boolean, default: false },
  Mail: { type: String, unique: true, required: true, match: /^\S+@\S+\.\S+$/ },
  Phone: { type: Number, unique: true, required: true, match: /^[0-9]{10}$/ },
  Name: { type: String, unique: true, required: true }
});

const UserRegisters = mongoose.model("UserRegisters", schema, "UserRegisters");

app.post("/userreg", async (req, res) => {
  try {
    const { Username, Password, Mail, Phone, Name } = req.body;

    // Basic validation for required fields
    if (!Username || !Password || !Mail || !Phone || !Name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username, email, or phone already exists
    const existingUser = await UserRegisters.findOne({
      $or: [{ Username }, { Mail }, { Phone }],
    });

    if (existingUser) {
      let conflictMessage = "This account already exists";
      if (existingUser.Username === Username) conflictMessage = "Username already taken";
      if (existingUser.Mail === Mail) conflictMessage = "Email already registered";
      if (existingUser.Phone === Phone) conflictMessage = "Phone number already registered";

      return res.status(400).json({ message: conflictMessage });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Save the new user
    const newUser = new UserRegisters({
      Username,
      Password: hashedPassword,
      Mail,
      Phone,
      Name,
    });

    const savedUser = await newUser.save();
    console.log("✅ DATA INSERTION SUCCESSFUL!!");
    res.status(201).json({
      message: "User created successfully",
      username: savedUser.Username,
    });

  } catch (error) {
    console.error("❌ DATA INSERTION FAILED!!", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.post('/userlogin', async (req, res) => {
  try {

    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    // Find user
    const user = await UserRegisters.findOne({ Username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.status(201).json({ message: "Login successful", username: user.Username });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal Server Error", error: err.message });

  }
})
const AdminRegisters = mongoose.model("AdminRegisters", schema, "AdminRegisters");


app.post('/adminlogin', async (req, res) => {
  try {

    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    // Find user
    const admin = await AdminRegisters.findOne({ Username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid Username" });
    }

    // Compare passwords

    // Compare passwords
    /*
        const bcrypt = require('bcrypt');*/
    const isPasswordMatch = await bcrypt.compare(Password, admin.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    res.status(201).json({ message: "Admin Logged successfully", username: admin.Username });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal Server Error", error: err.message });

  }
})


app.post("/adminreg", async (req, res) => {
  try {
    const { Username, Password, Mail, Phone, Name } = req.body;

    if (!Username || !Password || !Mail || !Phone || !Name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username, email, or phone already exists
    const existingUser = await UserRegisters.findOne({
      $or: [{ Username }, { Mail }, { Phone }],
    });

    if (existingUser) {
      let conflictMessage = "This account already exists";
      if (existingUser.Username === Username) conflictMessage = "Username already taken";
      if (existingUser.Mail === Mail) conflictMessage = "Email already registered";
      if (existingUser.Phone === Phone) conflictMessage = "Phone number already registered";

      return res.status(400).json({ message: conflictMessage });
    }
    
    // Check if the username already exists



    // Save new user
    const hashedpass = await bcrypt.hash(Password, 10);
    const newUser = new AdminRegisters({
      Username,
      isAdmin: true,
      Mail,
      Phone,
      Name,
      Password: hashedpass
    });

    const admin = await newUser.save();
    console.log("DATA INSERTION SUCCESSFULLY!!");
    res.status(201).json({ message: "Admin created successfully", username: admin.Username });
  } catch (e) {
    console.log("DATA INSERTION FAILED!!", e);
    res.status(500).json({ message: "Internal Server Error", error: e.message });
  }
});







//ADMIN 

app.use(express.urlencoded({ extended: true }));

const stationSchema = new mongoose.Schema({
  name: String,
  tel: { type: String, unique: true, required: true, match: /^[0-9]{10}$/ },
  location: String,
  MapURL: { type: String, default: "" },
  slots: Number,
  status: String,
  update: String,
  check: { type: Boolean, default: false }
});

app.use(express.static(path.join(__dirname, "../Client")));

const StationCreation = mongoose.model("StationCreation", stationSchema, "StationCreation");
/*
app.get("/admin", (req, res) => {
  console.log("✅ Admin page loading");
  res.sendFile(path.join(__dirname, "..", "..", "Client", "Admin", "manage.html"));
});
*/

// POST Route for Station Creation (No GET needed for form!)
app.post("/admin/create-station", async (req, res) => {
  const { name, tel, location, MapURL = "", slots, status, update, check } = req.body;

  try {
    const existingStation = await StationCreation.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      location: { $regex: new RegExp(`^${location}$`, "i") }
    });

    if (existingStation) {
      return res.status(400).send("Station already exists!");
    }
    const isBookingEnabled = check === "on";

    const newStation = new StationCreation({
      name,
      tel,
      location,
      MapURL,
      slots,
      status,
      update,
      check: isBookingEnabled
    });

    await newStation.save();
    res.send(
      `<script>
         alert("Station Created Successfully!");
         window.location.href = "/Admin/station.html";
       </script>`
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("<h2 style='color:red;'>Station Already Exists!</h2>");
  }
});



//list

app.get("/api/stations", async (req, res) => {
  try {
    const stations = await StationCreation.find({});
    res.json(stations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stations." });
  }
});


//update but in slots -admin

app.patch("/admin/update-station/:id", async (req, res) => {
  const { id } = req.params;
  const { slots, status, update } = req.body;

  try {
    const updatedStation = await StationCreation.findByIdAndUpdate(
      id,
      { slots, status, update },
      { new: true }
    );

    if (!updatedStation) return res.status(404).send({ message: "Station not found" });

    res.json(updatedStation);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to update station" });
  }
});


//user retrieve stations

app.get("/user/rtvstations", async (req, res) => {
  try {
    const data = await StationCreation.find({});
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: "Failed To Get Station List!!" });
  }
})

//http://localhost:3000/user/profiledata
// http://localhost:3000/user/profiledata/${Username}
app.get("/user/profiledata/:Username", async (req, res) => {
  try {
    const { Username } = req.params; // Extracts Username from the URL
    const data = await UserRegisters.findOne({ Username }); // findOne instead of find (returns a single user)
    console.log(Username)
    console.log(data)
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(data)
    res.json(data);
    console.log(data)
  } catch (e) {
    console.error("Failed to get user profile data:", e);
    res.status(500).json({ message: "Failed to get user profile data!", error: e.message });
  }
});
app.get("/admin/profiledata/:Username", async (req, res) => {
  try {
    const { Username } = req.params; // Extracts Username from the URL
    const data = await AdminRegisters.findOne({ Username }); // findOne instead of find (returns a single user)

    if (!data) {
      return res.status(404).json({ message: "Admin not found" });
    }
    console.log(data)
    res.json(data);
  } catch (e) {
    console.error("Failed to get Admin profile data:", e);
    res.status(500).json({ message: "Failed to get Admin profile data!", error: e.message });
  }
});


//user details

/*
app.get("/user/userdetails", async (req, res) => {
  try {
    
    const user = req.user;  // Assuming you store user info in req.user (e.g., JWT or session)
    if (user) {
        res.json({
            _id: user._id,
            Username: user.Username,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(401).json({ message: "No user logged in" });
    }
  } catch (e) {
    res.status(400).json({ message: "Failed To Get User Details!!" });
  }
})
*/







//BOOKING OTP
require("dotenv").config();
//process.env.TWILIO_PHONE_NUMBER;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// Twilio client
const client = twilio(accountSid, authToken);

// In-memory OTP storage
let generatedOtp = '';


// ✅ OTP Schema with expiry using TTL index
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // ⏳ expires after 5 minutes
});
const Otp = mongoose.model('Otp', otpSchema);



// Voice OTP endpoint
app.post('/call-otp', async (req, res) => {
  const { to } = req.body;

  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP: ${generatedOtp}`);

  //saving to db --otp
  console.log("OTP SAViNG IN DB")
  await Otp.create({ phone: to, otp: generatedOtp });

  const spokenOtp = generatedOtp.split('').join('     '); // For voice
  const smsMessage = `🔐 Your OTP is: ${generatedOtp}`;

  const twiml = `<Response>
    <Say voice="alice">Greeting there</Say>
    <Pause length="1"/>
    <Say voice="alice">I am Evision Bot</Say>
    <Pause length="1"/>
    <Say voice="alice">Your One Time Password is ${spokenOtp}</Say>
    <Pause length="1"/>
    <Say voice="alice">Repeating. Your One Time Password is ${spokenOtp}</Say>
  </Response>`;

  // 1️⃣ Send SMS
  client.messages.create({
    body: smsMessage,
    from: twilioNumber,
    to,
  }).then(message => {
    console.log(`📩 SMS sent: ${message.sid}`);

    // 2️⃣ After SMS, make the call
    client.calls.create({
      twiml,
      to,
      from: twilioNumber,
    }).then(call => {
      console.log(`📞 Call initiated: ${call.sid}`);
      res.send('✅ Voice + SMS OTP sent successfully!');
    }).catch(callError => {
      console.error('❌ Call failed:', callError);
      res.status(500).send('SMS sent, but voice call failed.');
    });

  }).catch(smsError => {
    console.error('❌ SMS failed:', smsError);
    res.status(500).send('Failed to send OTP via SMS and call.');
  });
});




// Booking Schema and Model
const BookingSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StationCreation',
    required: true
  },
  name: String,
  phone: String,
  vehicleNumber: String,
  date: String,
  slot: String
});

const BookingModel = mongoose.model("BookingModel", BookingSchema);

//User fills booking form + OTP → one click to submit
app.post("/api/book-slot", async (req, res) => {
  const { name, phone, vehicleNumber, date, slot, otp, stationId } = req.body;

  try {
    const existingOtp = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    console.log(existingOtp)
    console.log(otp)
    if (!existingOtp || existingOtp.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({ phone });

    // Check if station exists
    const station = await StationCreation.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    // Check slot availability
    const existingBooking = await BookingModel.findOne({
      stationId: station._id,
      date,
      slot
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Slot already booked for this station!" });
    }

    // Save booking
    await BookingModel.create({
      stationId: station._id,
      name,
      phone,
      vehicleNumber,
      date,
      slot
    });

    res.status(200).json({ message: "Booking successful!" });

  } catch (err) {
    console.error("❌ Booking error:", err.message);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});


//filtering slots 

app.get('/api/available-slots', async (req, res) => {
  const { stationId, date } = req.query;

  if (!stationId || !date) {
    return res.status(400).json({ message: 'Station ID and date are required' });
  }

  try {
    const bookedSlots = await BookingModel.find({ stationId, date }).select('slot');
    const booked = bookedSlots.map(entry => entry.slot);

    const allSlots = [
      "10:00 AM ~ 11:00 AM",
      "11:00 AM ~ 12:00 PM",
      "12:00 PM ~ 01:00 PM",
      "01:00 PM ~ 02:00 PM"
    ];

    const available = allSlots.filter(slot => !booked.includes(slot));

    res.json({ availableSlots: available });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slots', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`SERVER RUNNING ON ${port}`);
});
=======
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
>>>>>>> 0112f1ea278088e142be47a7004bfcd0bea884c1
