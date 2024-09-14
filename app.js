// app.js
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./firebaseConfig"); // Firebase configuration

const app = express();
const port = 3000;

// Set view engine to EJS
app.set("view engine", "ejs");

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.redirect("/signup");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

// Get all complaints sorted by likes (desc) and optionally filtered by branch
app.get("/", async (req, res) => {
    const branchFilter = req.query.branch || "all";
    const complaints = [];

    try {
        let query = db.collection("complaints").orderBy("likes", "desc");

        if (branchFilter !== "all") {
            query = query.where("branch", "==", branchFilter);
        }

        const snapshot = await query.get();
        snapshot.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });

        res.render("index", { data: complaints, branchFilter });
    } catch (error) {
        res.status(500).send("Error fetching complaints: " + error.message);
    }
});

// Add complaint form (GET)
app.get("/submit-complaint", (req, res) => {
    res.render("addComplaint");
});

// Add complaint (POST)
app.post("/submit-complaint", async (req, res) => {
    const { name, registration, branch, complaintType, details } = req.body;

    try {
        await db.collection("complaints").add({
            name,
            registration,
            branch,
            complaintType,
            details,
            likes: 0, // Initialize likes to 0
            date: new Date(),
        });
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error adding complaint: " + error.message);
    }
});

// Like a complaint (POST)
app.post("/like/:id", async (req, res) => {
    const complaintId = req.params.id;

    try {
        const complaintRef = db.collection("complaints").doc(complaintId);
        const complaint = await complaintRef.get();

        if (complaint.exists) {
            await complaintRef.update({
                likes: complaint.data().likes + 1,
            });
        }

        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error liking complaint: " + error.message);
    }
});

// Delete a complaint (POST)
app.post("/delete/:id", async (req, res) => {
    const complaintId = req.params.id;

    try {
        await db.collection("complaints").doc(complaintId).delete();
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error deleting complaint: " + error.message);
    }
});

// View complaint details (GET)
app.get("/view/:id", async (req, res) => {
    const complaintId = req.params.id;

    try {
        const complaintRef = db.collection("complaints").doc(complaintId);
        const complaint = await complaintRef.get();

        if (complaint.exists) {
            res.render("viewComplaint", {
                complaint: { id: complaint.id, ...complaint.data() },
            });
        } else {
            res.status(404).send("Complaint not found.");
        }
    } catch (error) {
        res.status(500).send("Error fetching complaint: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
