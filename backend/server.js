// server.js

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require ("path");
const { error } = require("console");
const bcrypt = require('bcrypt');

// const router = express.Router();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

// Database connection 
const db = mysql.createConnection({
    host: "localhost", 
    user: "root",
    password: "",
    database: "bookingsystemdb"
});

// Connect to mySql - testing database connection
db.connect(err =>{
    if(err) {
        console.error(" Database connection failed:", err);
    } else {
        console.log("Connected to MySql successfully!");
    }
});

// Sample test route 
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

//app.use(/"/services", services)

//API ROUTES - FETCHING DATA FROM THE DATABASE 

//  ==== INDEX.HTML =====
// API Route - Top Hotels 
app.get("/api/top-hotels", (req, res) => {
    const sql = "SELECT * FROM hotels LIMIT 7";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching top hotels:", err);
            res.status(500).json({error: "Database error"});
        } else {
            res.json(results);
        }
    });
});

// API Route - Top Restaurants
app.get("/api/top-restaurants", (req, res) => {
    const sql = "SELECT * FROM restaurants LIMIT 7";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching top restaurants:", err);
            res.status(500).json({error: "Database error"});
        } else {
            res.json(results);
        }
    });
});

// API Route - Top Attractions
app.get("/api/top-attractions", (req, res) => {
    const sql = "SELECT * FROM attractions LIMIT 7";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching top attractions:", err);
            res.status(500).json({error: "Database error"});
        } else {
            res.json(results);
        }
    });
});

// API Route - Top Events 
app.get("/api/top-events", (req, res) => {
    const sql = "SELECT * FROM events LIMIT 7";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching top events:", err);
            res.status(500).json({error: "Database error"});
        } else {
            res.json(results);
        }
    });
});

//  ===== HOTELS.HTML ======
// API route - Get all hotels 
app.get("/api/hotels", (req, res) => {
    const sql = "SELECT * FROM hotels";
    db.query(sql, (err, results) => {
        if(err) {
            console.error("Error fetching hotels:", err);
            res.status(500).json({error: "Database error"});
        } else {
            res.json(results); // send hotels back as JSON  
        }

    });
});

//  ==== ATTRACTIONS.HTML ======
// API route - Get all attractions
app.get("/api/attractions", (req, res) => {
    const sql = "SELECT * FROM attractions";
    db.query(sql, (err, results) => {
        if(err){
            console.error("Error fetching attractions: ", err);
            res.status(500).json({error:"Database error"}); 
        } else {
            res.json(results); // sends attractions back as JSON 
        }
    });
});

//  ===== EVENTS.HTML ======
//API route  - Get all events 
app.get("/api/events", (req, res) => {
    const sql = "SELECT * FROM events";
    db.query(sql, (err, results) => {
        if(err){
            console.error("Error fetching events: ", err);
            res.status(500).json({error:"Database error"});
        } else {
            res.json(results); // sends events back as JSON 
        }
    });
});

//  ====== RESTAURANTS.HTML ======
// API Route - Get all resturants 
app.get("/api/restaurants", (req, res) => {
    const sql = "SELECT * FROM restaurants";
    db.query(sql, (err, results) => {
        if(err) {
            console.error("Error fetching restaurants: ", err);
            res.status(500).json({error:"Database error"});
        } else {
            res.json(results); // send restaurants back as JSON
        }
    });
});


//  ===== LOGIN.HTML ======
// API Route - User login
app.post("/api/login", (req, res) => {
    const{ email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({success: false, message: "Please enter email and password."})
    }

    const sql = "SELECT ID, Email, FullName, Role, Password FROM users WHERE Email = ?"; 
    
    db.query(sql,[email, password], async(err, results) => {
        if(err) {
            console.error("Login error: ", err);
            res.status(500).json({error:"Database error"});
        } 

        if(results.length === 0){
            return res.json({success: false, message: "Invalid email or password"});

            
        }
        const user = results[0];
        try{
            // compare the password with the hashed password
            const passwordMatch = await bcrypt.compare(password, user.Password);

            if(passwordMatch){
                res.json({
                    success: true, 
                    user: {
                        id: user.ID, 
                        name: user.FullName, 
                        email: user.Email, 
                        role: user.Role
                    }
                });
            } else {
                res.json({success: false, message: "Invalid email or password" });
            }
        } catch(error){
            console.error("Bycrpt compare error:", error);
            return res.status(500).json({error: "Server error"});
        }
    });
});

//   ====== SIGNUP.HTML ======
// API ROUTE - New user sign up 
app.post("/api/signup", (req, res) => {
    const{ name, email, password } = req.body;

    if(!name || !email ||!password){
        return res.status(400).json({success: false, message: "Please fill all fields"});
    }
    // check if the given email already exists (user already exists)
    db.query("SELECT * FROM users WHERE Email = ?", [email], async(err, results) => {
        if(err) {
            console.error("Signup check error", err);
            return res.status(500).json({ error: "Database error" });
        }

        if(results.length > 0){
            return res.json({ success: false, message: "Email is already registered with a user."});
        }
        try{
            console.log("Hashing password...");
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Password haashed successfully");

             // insert the new user into the database
            const sql = "INSERT INTO users (FullName, Email, Password, Role) VALUES (?, ?, ?, 'user')";
            db.query(sql, [name, email, hashedPassword], (err, results) => {
                if(err){
                    console.error("Signup insert error:", err);
                    return res.status(500).json({ error: "Failed to create an account" });
            }

                res.json({
                    success: true, 
                    user: {
                        id: results.insertId,
                        name: name, 
                        email: email, 
                        role: 'user'
                    }
                });
        });

        } catch(error){
            console.error("Bcrypt error:", error);
            return res.status(500).json({error: "Server error"});
        }
    });
});


//  ====== PROFILE.HTML =======
// API ROUTE - Get user profile info 
app.get("/api/user/:id", (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT ID, FullName, Email, ProfilePicture, Role FROM users WHERE ID = ?";
    db.query(sql, [userId], (err, results) => {
        if(err){
            console.error("Error fetching user:", err);
            return res.status(500).json({ success: false, message: "Database error"});
        }
        if(results.length == 0){
            return res.status(500).json({ success: false, message:"User not found"});
        }
        res.json({ success: true, user: results[0] });
    });
});

// ===== BOOKINGS API =====

// API ROUTE - create a new booking 
app.post("/api/bookings", (req, res) => {
    const { userId, itemType, itemID, checkIn, checkOut, guests } = req.body;
    
    if (!userId || !itemType || !itemID) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate dates if provided
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
        return res.status(400).json({ success: false, message: "Check-out must be after check-in" });
    }

    const sql = `
        INSERT INTO bookings (UserID, ItemType, ItemID, CheckIn, CheckOut, Guests)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [userId, itemType, itemID, checkIn || null, checkOut || null, guests || null], (err, result) => {
        if (err) {
            console.error("Error adding booking:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, bookingId: result.insertId });
    });
});

// API ROUTE - get user bookings 
app.get("/api/bookings/:userId", (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT 
            b.ID, b.ItemType, b.ItemID, b.CheckIn, b.CheckOut, b.Guests, b.Status, b.CreatedAt,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.Name
                WHEN b.ItemType = 'restaurant' THEN r.Name
                WHEN b.ItemType = 'attraction' THEN a.Name
                WHEN b.ItemType = 'event' THEN e.Name
            END AS ItemName,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.ImagePath
                WHEN b.ItemType = 'restaurant' THEN r.ImagePath
                WHEN b.ItemType = 'attraction' THEN a.ImagePath
                WHEN b.ItemType = 'event' THEN e.ImagePath
            END AS ImagePath,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.Location
                WHEN b.ItemType = 'restaurant' THEN r.Location
                WHEN b.ItemType = 'attraction' THEN a.Location
                WHEN b.ItemType = 'event' THEN e.Location
            END AS Location,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.Price_Per_Night
                WHEN b.ItemType = 'restaurant' THEN r.Price_Range
                WHEN b.ItemType = 'attraction' THEN a.Price
                WHEN b.ItemType = 'event' THEN e.Price
            END AS Price
        FROM bookings b
        LEFT JOIN hotels h ON b.ItemType = 'hotel' AND b.ItemID = h.ID
        LEFT JOIN restaurants r ON b.ItemType = 'restaurant' AND b.ItemID = r.ID
        LEFT JOIN attractions a ON b.ItemType = 'attraction' AND b.ItemID = a.ID
        LEFT JOIN events e ON b.ItemType = 'event' AND b.ItemID = e.ID
        WHERE b.UserID = ?
        ORDER BY b.CreatedAt DESC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user's bookings:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, bookings: results });
    });
});

// API ROUTE - cancel a booking with userId check (for users from profile page)
app.patch("/api/bookings/:bookingId/cancel", (req, res) => {
    const bookingId = req.params.bookingId;
    const { userId } = req.body; // To verify ownership

    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
    }

    const sql = "UPDATE bookings SET Status = 'cancelled' WHERE ID = ? AND UserID = ? AND Status = 'confirmed'";
    
    db.query(sql, [bookingId, userId], (err, result) => {
        if (err) {
            console.error("Error cancelling booking:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Booking not found or already cancelled" });
        }
        
        res.json({ success: true, message: "Booking cancelled successfully" });
    });
});

// API ROUTE - get a single booking details
app.get("/api/booking/:bookingId", (req, res) => {
    const bookingId = req.params.bookingId;

    const sql = `
        SELECT 
            b.*,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.Name
                WHEN b.ItemType = 'restaurant' THEN r.Name
                WHEN b.ItemType = 'attraction' THEN a.Name
                WHEN b.ItemType = 'event' THEN e.Name
            END AS ItemName
        FROM bookings b
        LEFT JOIN hotels h ON b.ItemType = 'hotel' AND b.ItemID = h.ID
        LEFT JOIN restaurants r ON b.ItemType = 'restaurant' AND b.ItemID = r.ID
        LEFT JOIN attractions a ON b.ItemType = 'attraction' AND b.ItemID = a.ID
        LEFT JOIN events e ON b.ItemType = 'event' AND b.ItemID = e.ID
        WHERE b.ID = ?
    `;
    
    db.query(sql, [bookingId], (err, results) => {
        if (err) {
            console.error("Error fetching booking:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        
        res.json({ success: true, booking: results[0] });
    });
});

// API ROUTE - modify a booking
app.put("/api/bookings/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;
  const { userId, checkIn, checkOut, guests } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const sql = `
    UPDATE bookings
    SET CheckIn = ?, CheckOut = ?, Guests = ?
    WHERE ID = ? AND UserID = ? AND Status != 'cancelled'
  `;

  db.query(sql, [checkIn || null, checkOut || null, guests || null, bookingId, userId], (err, result) => {
    if (err) {
      console.error("Error updating booking:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found or already cancelled" });
    }

    res.json({ success: true, message: "Booking updated successfully" });
  });
});

// ===== PROFILE API  ===== 

// API ROUTE - get user bookings for profile 
app.get("/api/bookings/user/:userId", (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT 
            b.ID, b.ItemType, b.ItemID, b.CheckIn, b.CheckOut, b.Guests, b.Status, b.CreatedAt,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.Name
                WHEN b.ItemType = 'restaurant' THEN r.Name
                WHEN b.ItemType = 'attraction' THEN a.Name
                WHEN b.ItemType = 'event' THEN e.Name
            END AS ItemName,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.ImagePath
                WHEN b.ItemType = 'restaurant' THEN r.ImagePath
                WHEN b.ItemType = 'attraction' THEN a.ImagePath
                WHEN b.ItemType = 'event' THEN e.ImagePath
            END AS ImagePath,
            CASE 
                WHEN b.ItemType = 'hotel' THEN h.Location
                WHEN b.ItemType = 'restaurant' THEN r.Location
                WHEN b.ItemType = 'attraction' THEN a.Location
                WHEN b.ItemType = 'event' THEN e.Location
            END AS Location
        FROM bookings b
        LEFT JOIN hotels h ON b.ItemType = 'hotel' AND b.ItemID = h.ID
        LEFT JOIN restaurants r ON b.ItemType = 'restaurant' AND b.ItemID = r.ID
        LEFT JOIN attractions a ON b.ItemType = 'attraction' AND b.ItemID = a.ID
        LEFT JOIN events e ON b.ItemType = 'event' AND b.ItemID = e.ID
        WHERE b.UserID = ?
        ORDER BY b.CreatedAt DESC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user's bookings:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, bookings: results });
    });
});

// API ROUTE - Update user profile settings (with bcrypt for password)
app.put("/api/users/:userId", async (req, res) => { 
    const { userId } = req.params;
    const { name, email, password } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ success: false, message: "Name and email are required" });
    }
    
    try {
        // If password is provided, hash it
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const sql = "UPDATE users SET FullName = ?, Email = ?, Password = ? WHERE ID = ?";
            db.query(sql, [name, email, hashedPassword, userId], (err) => {
                if (err) {
                    console.error('Update user error:', err);
                    return res.status(500).json({ success: false, message: "Update failed" });
                }
                res.json({ success: true, message: "Profile updated successfully" });
            });
        } else {
            // Update without password
            const sql = "UPDATE users SET FullName = ?, Email = ? WHERE ID = ?";
            db.query(sql, [name, email, userId], (err) => {
                if (err) {
                    console.error('Update user error:', err);
                    return res.status(500).json({ success: false, message: "Update failed" });
                }
                res.json({ success: true, message: "Profile updated successfully" });
            });
        }
    } catch (error) {
        console.error("Bcrypt error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// API ROUTE - Delete user account
app.delete("/api/users/:userId", (req, res) => {
    const { userId } = req.params;
    
    // This will also delete all bookings due to CASCADE foreign key
    db.query("DELETE FROM users WHERE ID = ?", [userId], (err) => {
        if (err) {
            console.error('Delete user error:', err);
            return res.status(500).json({ success: false, message: "Delete failed" });
        }
        res.json({ success: true, message: "Account deleted successfully" });
    });
});

// ===== SEARCH & FILTER API ROUTES  =====
// Hotels - search and filter 
app.get("/api/hotels/search", (req,res) => {
    const { search, rating, roomType, priceRange, adults, children } = req.query;
    let sql = "SELECT * FROM hotels WHERE 1=1";
    let params = [];

    if(search){
        sql += " AND NAME LIKE ?";
        params.push(`%${search}%`);
    }

    if(rating){
        sql += " AND Stars = ?";
        params.push(rating);
    }

    if(roomType){
        sql += " AND Room_Type = ?";
        params.push(roomType);
    }

    if(priceRange){
        sql += " AND Price_Per_Night <= ?";
        params.push(parseFloat(priceRange));
    }

    sql += " ORDER BY Name";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error filtering hotels:", err);
            return res.status(500).json({error: "Database error" });
        }
        res.json(results);
    });
});


// RESTAURANTS - Search and Filter
app.get("/api/restaurants/search", (req, res) => {
    const { search, cuisine, rating, priceRange } = req.query;
    
    let sql = "SELECT * FROM restaurants WHERE 1=1";
    let params = [];
    
    if (search) {
        sql += " AND Name LIKE ?";
        params.push(`%${search}%`);
    }
    
    if (cuisine) {
        sql += " AND Cuisine LIKE ?";
        params.push(`%${cuisine}%`);
    }
    
    if (rating) {
        const ratingNum = parseFloat(rating.replace('★', ''));
        sql += " AND Rating >= ?";
        params.push(ratingNum);
    }
    
    // Price filter using IN operator with specific values
    // Note: Price_Range is stored as strings (e.g., "50-100", "200", "400+")
    // so we match against known database values rather than numeric comparison

    if (priceRange === "1") {
        // Budget: Under AED 100
        sql += " AND Price_Range IN ('50-100', '40-100')";
    } else if (priceRange === "2") {
        // Mid-Range: AED 100-300
        sql += " AND Price_Range IN ('200', '150-300')";
    } else if (priceRange === "3") {
        // Upscale: Above AED 300
        sql += " AND Price_Range IN ('250', '350', '250-400', '300-500', '300-600', '400+')";
    }
    
    sql += " ORDER BY Name";
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error filtering restaurants:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log("Restaurants found:", results.length);
        console.log("Restaurant names:", results.map(r => r.Name));
        res.json(results);
    });
});


// ATTRACTIONS - search and filter 
app.get("/api/attractions/search", (req, res) => {
    const { search, type, rating, priceRange } = req.query;
    
    let sql = "SELECT * FROM attractions WHERE 1=1";
    let params = [];
    
    if (search) {
        sql += " AND Name LIKE ?";
        params.push(`%${search}%`);
    }
    
    if (type) {
        sql += " AND Category = ?";
        params.push(type);
    }
    
    if (rating) {
        const ratingNum = parseFloat(rating.replace('★', ''));
        sql += " AND Rating >= ?";
        params.push(ratingNum);
    }
    
    if (priceRange) {
        sql += " AND Price <= ?";
        params.push(parseFloat(priceRange));
    }
    
    sql += " ORDER BY Name";
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error filtering attractions:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});


// EVENTS - search and filter 
app.get("/api/events/search", (req, res) => {
    const { search, type, date } = req.query;
    
    let sql = "SELECT * FROM events WHERE 1=1";
    let params = [];
    
    if (search) {
        sql += " AND Name LIKE ?";
        params.push(`%${search}%`);
    }
    
    if (type) {
        sql += " AND Category = ?";
        params.push(type);
    }
    
    if (date) {
        sql += " AND ? BETWEEN Start_Date AND End_Date";
        params.push(date);
    }
    
    sql += " ORDER BY Start_Date";
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error filtering events:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});


// ===== FAVOURITES API ROUTES =====
// API ROUTE - Add item to favourites 
app.post("/api/favorites", (req,res) => {
    const { userId, itemType, itemID } = req.body;

    if(!userId || !itemType || !itemID) {
        return res.status(400).json({ success: false, message: "Missing required fields"});
    }

    const sql = "INSERT INTO favorites (UserID, ItemType, ItemID) Values (?, ?, ?)";

    db.query(sql, [userId, itemType, itemID], (err, result) => {
        if(err) {
            // check if the item is already favourited 
            if(err.code === 'ER_DUP_ENTRY'){
                return res.status(400).json({ success: false, message: "Item already in favourites"});
            }
            console.error("Error adding favourite:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, favouriteId: result.insertId});
    });

});

// API ROUTE - remove an item from favourites 
app.delete("/api/favorites", (req,res) => {
    const {userId, itemType, itemID} = req.body;

    if(!userId || !itemType || !itemID){
        return res.status(400).json({ success: false, message: "Missing required fields"});
    }

    const sql = "DELETE FROM favorites WHERE UserID = ? and ItemType = ? AND ItemID = ?";

    db.query(sql, [userId, itemType, itemID], (err, result) => {
        if (err) {
            console.error("Error removing favorite:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Favorite not found" });
        }
        
        res.json({ success: true, message: "Removed from favorites" });
    });
});

// API ROUTE - Get user's favorites
app.get("/api/favorites/:userId", (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT 
            f.ID, f.ItemType, f.ItemID, f.CreatedAt,
            CASE 
                WHEN f.ItemType = 'hotel' THEN h.Name
                WHEN f.ItemType = 'restaurant' THEN r.Name
                WHEN f.ItemType = 'attraction' THEN a.Name
                WHEN f.ItemType = 'event' THEN e.Name
            END AS ItemName,
            CASE 
                WHEN f.ItemType = 'hotel' THEN h.ImagePath
                WHEN f.ItemType = 'restaurant' THEN r.ImagePath
                WHEN f.ItemType = 'attraction' THEN a.ImagePath
                WHEN f.ItemType = 'event' THEN e.ImagePath
            END AS ImagePath,
            CASE 
                WHEN f.ItemType = 'hotel' THEN h.Location
                WHEN f.ItemType = 'restaurant' THEN r.Location
                WHEN f.ItemType = 'attraction' THEN a.Location
                WHEN f.ItemType = 'event' THEN e.Location
            END AS Location,
            CASE 
                WHEN f.ItemType = 'hotel' THEN h.Price_Per_Night
                WHEN f.ItemType = 'restaurant' THEN r.Price_Range
                WHEN f.ItemType = 'attraction' THEN a.Price
                WHEN f.ItemType = 'event' THEN e.Price
            END AS Price,
            CASE 
                WHEN f.ItemType = 'hotel' THEN h.Description
                WHEN f.ItemType = 'restaurant' THEN r.Description
                WHEN f.ItemType = 'attraction' THEN a.Description
                WHEN f.ItemType = 'event' THEN e.Description
            END AS Description
        FROM favorites f
        LEFT JOIN hotels h ON f.ItemType = 'hotel' AND f.ItemID = h.ID
        LEFT JOIN restaurants r ON f.ItemType = 'restaurant' AND f.ItemID = r.ID
        LEFT JOIN attractions a ON f.ItemType = 'attraction' AND f.ItemID = a.ID
        LEFT JOIN events e ON f.ItemType = 'event' AND f.ItemID = e.ID
        WHERE f.UserID = ?
        ORDER BY f.CreatedAt DESC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching favorites:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, favorites: results });
    });
});

// API ROUTE - Check if an item is favorited
app.get("/api/favorites/check/:userId/:itemType/:itemID", (req, res) => {
    const { userId, itemType, itemID } = req.params;
    
    const sql = "SELECT ID FROM favorites WHERE UserID = ? AND ItemType = ? AND ItemID = ?";
    
    db.query(sql, [userId, itemType, itemID], (err, results) => {
        if (err) {
            console.error("Error checking favorite:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, isFavorited: results.length > 0 });
    });
});


// ===== ADMIN ROUTES =====

// GET ALL BOOKINGS (for admin dashboard)
app.get("/api/admin/bookings", (req, res) => {
    const sql = `
        SELECT b.*, 
               u.FullName as user_name, 
               u.Email as user_email,
               CASE 
                   WHEN b.ItemType = 'hotel' THEN h.Name
                   WHEN b.ItemType = 'restaurant' THEN r.Name
                   WHEN b.ItemType = 'attraction' THEN a.Name
                   WHEN b.ItemType = 'event' THEN e.Name
               END as item_name
        FROM bookings b
        JOIN users u ON b.UserID = u.ID
        LEFT JOIN hotels h ON b.ItemType = 'hotel' AND b.ItemID = h.ID
        LEFT JOIN restaurants r ON b.ItemType = 'restaurant' AND b.ItemID = r.ID
        LEFT JOIN attractions a ON b.ItemType = 'attraction' AND b.ItemID = a.ID
        LEFT JOIN events e ON b.ItemType = 'event' AND b.ItemID = e.ID
        ORDER BY b.CreatedAt DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching all bookings:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// GET STATISTICS (for admin dashboard)
app.get("/api/admin/stats", (req, res) => {
    const queries = {
        totalUsers: "SELECT COUNT(*) as count FROM users",
        totalBookings: "SELECT COUNT(*) as count FROM bookings",
        totalHotels: "SELECT COUNT(*) as count FROM hotels",
        totalRestaurants: "SELECT COUNT(*) as count FROM restaurants",
        totalAttractions: "SELECT COUNT(*) as count FROM attractions",
        totalEvents: "SELECT COUNT(*) as count FROM events"
    };
    
    const stats = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, results) => {
            if (!err) {
                stats[key] = results[0].count;
            }
            completed++;
            
            if (completed === Object.keys(queries).length) {
                res.json(stats);
            }
        });
    });
});

// ===== HOTELS ADMIN =====
app.post("/api/admin/hotels", (req, res) => {
    const { name, roomType, description, location, price, stars, capacity, imagePath } = req.body;
    
    const sql = "INSERT INTO hotels (Name, Room_Type, Description, Location, Price_Per_Night, Stars, Capacity, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, roomType, description, location, price, stars, capacity, imagePath], (err, result) => {
        if (err) {
            console.error("Error adding hotel:", err);
            return res.status(500).json({ error: "Failed to add hotel" });
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.put("/api/admin/hotels/:id", (req, res) => {
    const { id } = req.params;
    const { name, roomType, description, location, price, stars, capacity, imagePath } = req.body;
    
    const sql = "UPDATE hotels SET Name = ?, Room_Type = ?, Description = ?, Location = ?, Price_Per_Night = ?, Stars = ?, Capacity = ?, ImagePath = ? WHERE ID = ?";
    db.query(sql, [name, roomType, description, location, price, stars, capacity, imagePath, id], (err) => {
        if (err) {
            console.error("Error updating hotel:", err);
            return res.status(500).json({ error: "Update failed" });
        }
        res.json({ success: true });
    });
});

app.delete("/api/admin/hotels/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM hotels WHERE ID = ?", [id], (err) => {
        if (err) {
            console.error("Error deleting hotel:", err);
            return res.status(500).json({ error: "Delete failed" });
        }
        res.json({ success: true });
    });
});

// ===== RESTAURANTS ADMIN =====
app.post("/api/admin/restaurants", (req, res) => {
    const { name, description, location, cuisine, priceRange, rating, imagePath } = req.body;
    
    const sql = "INSERT INTO restaurants (Name, Description, Location, Cuisine, Price_Range, Rating, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, description, location, cuisine, priceRange, rating, imagePath], (err, result) => {
        if (err) {
            console.error("Error adding restaurant:", err);
            return res.status(500).json({ error: "Failed to add restaurant" });
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.put("/api/admin/restaurants/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, location, cuisine, priceRange, rating, imagePath } = req.body;
    
    const sql = "UPDATE restaurants SET Name = ?, Description = ?, Location = ?, Cuisine = ?, Price_Range = ?, Rating = ?, ImagePath = ? WHERE ID = ?";
    db.query(sql, [name, description, location, cuisine, priceRange, rating, imagePath, id], (err) => {
        if (err) {
            console.error("Error updating restaurant:", err);
            return res.status(500).json({ error: "Update failed" });
        }
        res.json({ success: true });
    });
});

app.delete("/api/admin/restaurants/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM restaurants WHERE ID = ?", [id], (err) => {
        if (err) {
            console.error("Error deleting restaurant:", err);
            return res.status(500).json({ error: "Delete failed" });
        }
        res.json({ success: true });
    });
});

// ===== ATTRACTIONS ADMIN =====
app.post("/api/admin/attractions", (req, res) => {
    const { name, description, location, rating, price, category, imagePath } = req.body;
    
    const sql = "INSERT INTO attractions (Name, Description, Location, Rating, Price, Category, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, description, location, rating, price, category, imagePath], (err, result) => {
        if (err) {
            console.error("Error adding attraction:", err);
            return res.status(500).json({ error: "Failed to add attraction" });
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.put("/api/admin/attractions/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, location, rating, price, category, imagePath } = req.body;
    
    const sql = "UPDATE attractions SET Name = ?, Description = ?, Location = ?, Rating = ?, Price = ?, Category = ?, ImagePath = ? WHERE ID = ?";
    db.query(sql, [name, description, location, rating, price, category, imagePath, id], (err) => {
        if (err) {
            console.error("Error updating attraction:", err);
            return res.status(500).json({ error: "Update failed" });
        }
        res.json({ success: true });
    });
});

app.delete("/api/admin/attractions/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM attractions WHERE ID = ?", [id], (err) => {
        if (err) {
            console.error("Error deleting attraction:", err);
            return res.status(500).json({ error: "Delete failed" });
        }
        res.json({ success: true });
    });
});

// ===== EVENTS ADMIN =====
app.post("/api/admin/events", (req, res) => {
    const { name, description, location, startDate, endDate, price, category, imagePath } = req.body;
    
    const sql = "INSERT INTO events (Name, Description, Location, Start_Date, End_Date, Price, Category, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, description, location, startDate, endDate, price, category, imagePath], (err, result) => {
        if (err) {
            console.error("Error adding event:", err);
            return res.status(500).json({ error: "Failed to add event" });
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.put("/api/admin/events/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, location, startDate, endDate, price, category, imagePath } = req.body;
    
    const sql = "UPDATE events SET Name = ?, Description = ?, Location = ?, Start_Date = ?, End_Date = ?, Price = ?, Category = ?, ImagePath = ? WHERE ID = ?";
    db.query(sql, [name, description, location, startDate, endDate, price, category, imagePath, id], (err) => {
        if (err) {
            console.error("Error updating event:", err);
            return res.status(500).json({ error: "Update failed" });
        }
        res.json({ success: true });
    });
});

app.delete("/api/admin/events/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM events WHERE ID = ?", [id], (err) => {
        if (err) {
            console.error("Error deleting event:", err);
            return res.status(500).json({ error: "Delete failed" });
        }
        res.json({ success: true });
    });
});

// API ROUTE - Admin cancel any booking (no userId check)
app.patch("/api/admin/bookings/:bookingId/cancel", (req, res) => {
    const bookingId = req.params.bookingId;

    const sql = "UPDATE bookings SET Status = 'cancelled' WHERE ID = ? AND Status = 'confirmed'";
    
    db.query(sql, [bookingId], (err, result) => {
        if (err) {
            console.error("Error cancelling booking (admin):", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Booking not found or already cancelled" });
        }
        
        res.json({ success: true, message: "Booking cancelled successfully by admin" });
    });
});

// API ROUTE - Admin delete booking permanently
app.delete("/api/admin/bookings/:bookingId", (req, res) => {
    const bookingId = req.params.bookingId;
    
    db.query("DELETE FROM bookings WHERE ID = ?", [bookingId], (err) => {
        if (err) {
            console.error("Error deleting booking (admin):", err);
            return res.status(500).json({ error: "Delete failed" });
        }
        res.json({ success: true, message: "Booking deleted successfully" });
    });
});


// Start the server 
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
