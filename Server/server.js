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
app.use(cors({ origin: "https://e-vision-drive.vercel.app" }));
import twilio from "twilio"
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)////newdb
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

app.post("/adminreg", async (req, res) => {
  try {
    const { Username, Password, Mail, Phone, Name } = req.body;

    if (!Username || !Password || !Mail || !Phone || !Name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username, email, or phone already exists
    const existingUser = await AdminRegisters.findOne({
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


app.post('/adminlogin', async (req, res) => {
  try {

    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    console.log("Finding admin user...");
    // Find user
    //const admin = await AdminRegisters.findOne({ Username });
    const admin = await AdminRegisters.findOne({ Username }).select('+Password');

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
    res.status(201).json({ message: "Admin Logged successfully", username: admin.Username});

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal Server Error", error: e.message });

  }
})







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
  booking: { type: Boolean, default: false },
  
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
  const { name, tel, location, MapURL = "", slots, status, update, booking } = req.body;

  try {
    const existingStation = await StationCreation.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      location: { $regex: new RegExp(`^${location}$`, "i") }
    });

    if (existingStation) {
      return res.status(400).send("Station already exists!");
    }
    const isBookingEnabled = booking === true || booking === "on";


    const newStation = new StationCreation({
      name,
      tel,
      location,
      MapURL,
      slots,
      status,
      update,
      booking: isBookingEnabled
    });

    await newStation.save();
    res.json(newStation);
    

  } catch (err) {
    console.error(err);
    return res.status(500).send("<h2 style='color:red;'>Station Already Exists!</h2>");
  }
});


//************/
app.get("/stations/:id", async (req, res) => {
  try {
    const station = await StationCreation.findById(req.params.id);
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/stations/:id/isbooking", async (req, res) => {
  try {
    const station = await StationCreation.findById(req.params.id);
    if (!station) return res.status(404).json({ error: "Station not found" });

    if (station.status !== "Active") {
      return res.json({ message: station.booking, status: false });
    }
    console.log("BACKEND ---- Booking status for station", req.params.id, "is", station.booking,"and status is", station.status);

    res.json({ message: station.booking, status: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "sorry" });
  }
});


app.get("/stations/:id/bookings", async (req, res) => {
  try {
    const stationId = req.params.id;
    const bookings = await BookingModel.find({ stationId: stationId });

    if (!bookings) {
      return res.status(404).json({ message: "No bookings found for this station" });
    }

    console.log("Bookings fetched:", bookings);
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/stations/:id/bookings/unseen", async (req, res) => {
  try {
    const stationId = req.params.id;
    const unseenCount = await BookingModel.countDocuments({ stationId, is_seen: false });
    const totalCount = await BookingModel.countDocuments({ stationId });
    console.log(`IN BACKEND -- Unseen bookings for station ${stationId}:`, unseenCount);
    res.json({ count: unseenCount, length: totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


 
app.post("/stations/:id/bookings/mark-seen", async (req, res) => {
  try {
    const stationId = req.params.id;
    await BookingModel.updateMany(
      { stationId, is_seen: false },
      { $set: { is_seen: true } }
    );
    res.json({ message: "Bookings marked as seen" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



app.get("/:username/historybookings", async (req, res) => {
  try {
    const username = req.params.username;
    const bookings = await BookingModel.find({ user: username })
                                       .sort({ date: -1 })
                                       .lean(); 
                                       // optional: returns plain JS objects

    console.log(`History bookings for user ${username}:`, bookings);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
//require("dotenv").config();
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
  slot: String,
  is_seen: { type: Boolean, default: false },
  user: String,
  email: String
});

const BookingModel = mongoose.model("BookingModel", BookingSchema);


app.post("/api/book-slot", async (req, res) => {
  const { name, phone, vehicleNumber, date, slot, otp, stationId, user, mail } = req.body;


  try {
    // 1. Get latest OTPs for phone and email
    const phoneOtpDoc = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    const emailOtpDoc = await EmailOtp.findOne({ email: mail }).sort({ createdAt: -1 });

    // 2. Check validity
    const phoneValid = phoneOtpDoc && phoneOtpDoc.otp === otp;
    const emailValid = emailOtpDoc && emailOtpDoc.otp === otp;

    if (!phoneValid && !emailValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 3. Clean up used OTP
    if (phoneValid) {
      await Otp.deleteMany({ phone });
    }
    if (emailValid) {
      await EmailOtp.deleteMany({ email: mail });
    }

    // 4. Check if station exists
    const station = await StationCreation.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    // 5. Check slot availability
    const existingBooking = await BookingModel.findOne({
      stationId: station._id,
      date,
      slot
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Slot already booked for this station!" });
    }

    // 6. Save booking
    await BookingModel.create({
      stationId: station._id,
      name,
      phone,
      vehicleNumber,
      date,
      slot,
      user,
      email: mail
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


// Update schema to store OTP
const forgetpassOTPSchema = new mongoose.Schema({
  email: String,
  otp: String,
  otpExpiry: Date
});

const ForgetpassOTP = mongoose.model("ForgetpassOTP", forgetpassOTPSchema);

// ✅ Send OTP route
app.post("/send-otp", async (req, res) => {
  const { Mail } = req.body;
  const user = await UserRegisters.findOne({ Mail });

  if (!user) {
    return res.json({ registered: false, message: "❌ Email not registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Replace old OTP if exists
  await ForgetpassOTP.findOneAndUpdate(
    { email: Mail },
    { otp, otpExpiry: expiry },
    { upsert: true, new: true }
  );

  // Send OTP via SendGrid
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY
    }
  });

  try {
    await transporter.sendMail({
    from: "shaikumaralthaf003@gmail.com", // Verified Sender In SendGrid
    to: Mail,
    subject: "🔐 Your One-Time Password (OTP)",
    text: `Hello ${ForgetpassOTP.Name},

Your One-Time Password (OTP) Is: ${otp}

Please Use This Code To Complete Your Verification.
This Code Will Expire In 5 Minutes For Security Reasons.

If You Did Not Request This, You Can Safely Ignore This Email.

Best Regards,
Team Sprint Squad`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2>🔐 Verification Required</h2>
        <p>Hello ${ForgetpassOTP.Name},</p>
        <p>Your One-Time Password (OTP) Is:</p>
        <h1 style="color:#4caf50;">${otp}</h1>
        <p>Please Enter This Code To Complete Your Verification.<br>
        <b>Note:</b> This Code Will Expire In <b>5 Minutes</b>.</p>
        <p>If You Did Not Request This Code, You Can Ignore This Email.</p>
        <br>
        <p>Best Regards,<br><b>Team Sprint Squad</b></p>
      </div>
    `
  });

  console.log(`${ForgetpassOTP.Name}`)
  console.log(`${ForgetpassOTP}`)
    res.json({ registered: true, message: "✅ OTP sent to email" });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ registered: true, message: "❌ Failed to send OTP" });
  }
});


const emailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 mins expiry
});

const EmailOtp = mongoose.model('EmailOtp', emailOtpSchema);

app.post("/send-otp-booking", async (req, res) => {
  const { Mail } = req.body;
  const user = await UserRegisters.findOne({ Mail });
  

  if (!user) {
    return res.json({ registered: false, message: "❌ Email not registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Replace old OTP if exists
  await EmailOtp.findOneAndUpdate(
    { email: Mail },
    { otp, otpExpiry: expiry },
    { upsert: true, new: true }
  );

  // Send OTP via SendGrid
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY
    }
  });

  try {
    await transporter.sendMail({
    from: "duotechcodex@gmail.com", // Verified Sender In SendGrid
    to: Mail,
    subject: "🔐 Your One-Time Password (OTP)",
    text: `Hello Member,

Your One-Time Password (OTP) Is: ${otp}

Please Use This Code To Complete Your Verification.
This Code Will Expire In 5 Minutes For Security Reasons.

If You Did Not Request This, You Can Safely Ignore This Email.

Best Regards,
Team Sprint Squad`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2>🔐 Verification Required</h2>
        <p>Hello Member,</p>
        <p>Your One-Time Password (OTP) Is:</p>
        <h1 style="color:#4caf50;">${otp}</h1>
        <p>Please Enter This Code To Complete Your Verification.<br>
        <b>Note:</b> This Code Will Expire In <b>5 Minutes</b>.</p>
        <p>If You Did Not Request This Code, You Can Ignore This Email.</p>
        <br>
        <p>Best Regards,<br><b>Team Sprint Squad</b></p>
      </div>
    `
  });

  
    res.json({ registered: true, message: "✅ OTP sent to email" });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ registered: true, message: "❌ Failed to send OTP" });
  }
});



app.post("/admin-signup-otp", async (req, res) => {
  const { Mail } = req.body;
  const admin = await AdminRegisters.findOne({ Mail });
  console.log(Mail)

  if (admin) {
    return res.json({registered: false, message: "❌ Email already registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Replace old OTP if exists
  await EmailOtp.findOneAndUpdate(
    { email: Mail },
    { otp, otpExpiry: expiry },
    { upsert: true, new: true }
  );

  // Send OTP via SendGrid
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY
    }
  });

  try {
    await transporter.sendMail({
    from: "duotechcodex@gmail.com", // Verified Sender In SendGrid
    to: Mail,
    subject: "🔐 Your One-Time Password (OTP)",
    text: `Hello ADMIN Member,

Your One-Time Password (OTP) Is: ${otp}

Please Use This Code To Complete Your Verification.
This Code Will Expire In 5 Minutes For Security Reasons.

If You Did Not Request This, You Can Safely Ignore This Email.

Best Regards,
Team Sprint Squad`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2>🔐 Verification Required</h2>
        <p>Hello Member,</p>
        <p>Your One-Time Password (OTP) Is:</p>
        <h1 style="color:#4caf50;">${otp}</h1>
        <p>Please Enter This Code To Complete Your Verification.<br>
        <b>Note:</b> This Code Will Expire In <b>5 Minutes</b>.</p>
        <p>If You Did Not Request This Code, You Can Ignore This Email.</p>
        <br>
        <p>Best Regards,<br><b>Team Sprint Squad</b></p>
      </div>
    `
  });



    res.json({ registered: true, message: "✅ OTP sent to email" , otp });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ registered: true, message: "❌ Failed to send OTP" });
  }
});




// ✅ Verify OTP route
app.post("/verify-otp", async (req, res) => {
  const { Mail, otp } = req.body;

  const record = await ForgetpassOTP.findOne({ email: Mail, otp });

  if (!record) return res.json({ message: "❌ Invalid OTP" });
  if (Date.now() > record.otpExpiry) return res.json({ message: "⚠️ OTP expired" });

  // Delete OTP after successful verification
  await ForgetpassOTP.deleteOne({ email: Mail });

  res.json({ message: "✅ OTP verified successfully" });
});

app.post("/verify-otpss", async (req, res) => {
  const { Mail, otp } = req.body;

  const record = await ForgetpassOTP.findOne({ email: Mail, otp });

  if (!record) return res.json({ message: "❌ Invalid OTP" });
  if (Date.now() > record.otpExpiry) return res.json({ message: "⚠️ OTP expired" });

  // Delete OTP after successful verification
  //await ForgetpassOTP.deleteOne({ email: Mail });



  const newOtp = new Otp({
  phone: Mail,  // if you changed the field name from phone → contact
  otp: otp
});

newOtp.save()
  .then(() => console.log('OTP saved successfully'))
  .catch(err => console.error('Error saving OTP:', err));
  res.json({ message: "✅ OTP verified successfully"});
});


// ✅ Reset Password route
app.post("/reset-password", async (req, res) => {
  const { Mail, newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await UserRegisters.findOne({ Mail });
  if (!user) return res.json({ message: "❌ User not found" });

  user.Password = hashedPassword;
  await user.save();

  res.json({ message: "✅ Password reset success" });
});


//admin-forget pass


// ✅ Send OTP route
app.post("/send-otp/admin", async (req, res) => {
  const { Mail } = req.body;
  const user = await AdminRegisters.findOne({ Mail });

  if (!user) {
    return res.json({ registered: false, message: "❌ Email not registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Replace old OTP if exists
  await ForgetpassOTP.findOneAndUpdate(
    { email: Mail },
    { otp, otpExpiry: expiry },
    { upsert: true, new: true }
  );

  // Send OTP via SendGrid
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY
    }
  });


  try {

  await transporter.sendMail({
    from: "duotechcodex@gmail.com", // Verified Sender In SendGrid
    to: Mail,
    subject: "🔐 Your One-Time Password (OTP)",
    text: `Hello ${ForgetpassOTP.Name} (ADMIN) !!,

Your One-Time Password (OTP) Is: ${otp}

Please Use This Code To Complete Your Verification.
This Code Will Expire In 5 Minutes For Security Reasons.

If You Did Not Request This, You Can Safely Ignore This Email.

Best Regards,
Team Sprint Squad`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2>🔐 Verification Required</h2>
        <p>Hello, ${ForgetpassOTP.Name} (ADMIN) !!</p>
        <p>Your One-Time Password (OTP) Is:</p>
        <h1 style="color:#4caf50;">${otp}</h1>
        <p>Please Enter This Code To Complete Your Verification.<br>
        <b>Note:</b> This Code Will Expire In <b>5 Minutes</b>.</p>
        <p>If You Did Not Request This Code, You Can Ignore This Email.</p>
        <br>
        <p>Best Regards,<br><b>Team Sprint Squad</b></p>
      </div>
    `
  });

  console.log(`${ForgetpassOTP.Name}`)
    res.json({ registered: true, message: "✅ OTP sent to email" });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ registered: true, message: "❌ Failed to send OTP" });
  }
});

// ✅ Verify OTP route
app.post("/verify-otp/admin", async (req, res) => {
  const { Mail, otp } = req.body;

  const record = await ForgetpassOTP.findOne({ email: Mail, otp });

  if (!record) return res.json({ message: "❌ Invalid OTP" });
  if (Date.now() > record.otpExpiry) return res.json({ message: "⚠️ OTP expired" });

  // Delete OTP after successful verification
  await ForgetpassOTP.deleteOne({ email: Mail });

  res.json({ message: "✅ OTP verified successfully" });
});

// ✅ Reset Password route
app.post("/reset-password/admin", async (req, res) => {
  const { Mail, newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await AdminRegisters.findOne({ Mail });
  if (!user) return res.json({ message: "❌ User not found" });

  user.Password = hashedPassword;
  await user.save();

  res.json({ message: "✅ Password reset success" });
});


app.get("/api/users/count", async (req, res) => {
  try {
    const userCount = await UserRegisters.countDocuments();
    console.log(userCount)
    res.json({ count: userCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user count." });
  }
});

app.get("/api/bookings/count", async (req, res)=>{
  try {
    const bookingCount = await BookingModel.countDocuments();
    console.log(bookingCount)
    res.json({ count: bookingCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch booking count." });
  }
});

app.get("/api/bookings/during", async (req, res)=>{
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const bookingsToday = await BookingModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    console.log(bookingsToday)
    res.json({ count: bookingsToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings during the day." });
  }
});

app.get("/api/stations/count", async (req, res)=>{

  try {
    const stationCount = await StationCreation.countDocuments();
    console.log(stationCount)
    res.json({ count: stationCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch station count." });
  }
});

app.get("/api/stations/low-slots", async (req, res) => {
  try {
    const lowSlotStations = await StationCreation.find({ slots: { $lt: 4 } });
    console.log(lowSlotStations)
    res.json({ count: lowSlotStations.length, stations: lowSlotStations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch low slot stations." });
  }

});

app.get("/api/stations/no-booking", async(req, res) => {
  console.log("Entered no-booking route");
  try {
    console.log("Fetching stations with no booking availability...");
    const noBookingStations = await StationCreation.find({ booking: false});
    console.log("No booking stations:", noBookingStations);
    console.log("Count of no booking stations:", noBookingStations.length);
    res.json({ count: noBookingStations.length});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stations with no booking availability." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
