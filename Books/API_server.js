import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 4000;
const API_URL = "http://localhost:4000";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Books",
  password: "Ricky@2004",
  port: 5432,
})
db.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/all-date", async(req, res) => {
  try{
    const response = await db.query("SELECT * FROM summary ORDER BY entry_date DESC");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send("Error fetching items");
  }
});

app.get("/all-title", async (req, res) => {
  try{
    const response = await db.query("SELECT * FROM summary ORDER BY title ASC");
    res.status(200).json(response.rows);
  }catch (error) {
    res.status(500).send("Error fetching items", error);
  }
})

app.get("/all-rating", async (req, res) => {
  try{
    const response = await db.query("SELECT * FROM summary ORDER BY rating DESC");
    res.status(200).json(response.rows);
  }catch (error) {
    res.status(500).send("Error fetching items");
  }
})

app.post("/add", async(req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send("Request body is required");
  }

  if(req.body.title === undefined || req.body.author === undefined || req.body.rating === undefined || req.body.summary === undefined){
    return res.status(400).send("Title, author, rating, and summary are required");
  }
  const title = req.body.title;
  const author = req.body.author;
  const rating = parseFloat(req.body.rating);  
  const summary = req.body.summary;
  
  // Validate types first
  if(typeof summary !== "string" || typeof title !== "string" || typeof author !== "string"){
    return res.status(400).send("Title, author, and summary must be strings");
  }

  if (isNaN(rating)){
    return res.status(400).send("Rating must be a valid number");
  }

  // Now safe to use .trim() and check ranges
  if (title.trim() === "" || summary.trim() === "") {
    return res.status(400).send("Title and summary cannot be empty");
  }

  if(rating < 1 || rating > 10){
    return res.status(400).send("Rating must be between 1 and 10");
  }
  let book_url = null;
  
  try{
    const book_id = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
    
    // Check if book was found
    if (!book_id.data.docs || book_id.data.docs.length === 0) {
      return res.status(404).send("Book not found in Open Library. Please check the title and author and try again.");
    }
    
    // Get cover URL if available
    if (book_id.data.docs[0].cover_i) {
      book_url = `https://covers.openlibrary.org/b/id/${book_id.data.docs[0].cover_i}-L.jpg`;
      console.log("Cover URL:", book_url);
    } else {
      console.log("No cover image available for this book");
    }
  } catch (error) {
    console.log("Error fetching book from Open Library:", error);
    return res.status(503).send("Unable to verify book. Open Library service unavailable.");
  }

  try{
    await db.query("INSERT INTO summary (title, author, rating, summary, image_url) VALUES ($1, $2, $3, $4, $5)", [title, author, rating, summary, book_url]);
    res.status(201).send("Book added successfully");
  } catch (error) {
    console.log("Database error:", error);
    res.status(500).send("Error adding book");
  }
})

app.patch("/edit/:id", async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send("Request body is required");
  }
  
  const id = req.params.id;
  const key = [];
  const value = [];
  let params =0;

  // Check if updating title or author - both must be provided together
  if(req.body.title !== undefined || req.body.author !== undefined){
    // If updating either title or author, BOTH must be provided
    if(req.body.title === undefined || req.body.author === undefined){
      return res.status(400).send("Both title and author are required when updating either field");
    }
    
    const title = req.body.title;
    const author = req.body.author;
    
    // Validate types and empty strings
    if (typeof title !== 'string' || typeof author !== 'string') {
      return res.status(400).send("Title and author must be strings");
    }
    
    if (title.trim() === "" || author.trim() === "") {
      return res.status(400).send("Title and author cannot be empty");
    }
    
    key.push(`title = $${++params}`);
    value.push(title);
    key.push(`author = $${++params}`);
    value.push(author);
    
    let book_url = null;
    try{
      const book_id = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
    
      // Check if book was found
      if (!book_id.data.docs || book_id.data.docs.length === 0) {
        return res.status(404).send("Book not found in Open Library. Please check the title and author and try again.");
      }
    
      // Get cover URL if available
      if (book_id.data.docs[0].cover_i) {
        book_url = `https://covers.openlibrary.org/b/id/${book_id.data.docs[0].cover_i}-L.jpg`;
        console.log("Cover URL:", book_url);
      } else {
        console.log("No cover image available for this book");
      }
    } catch (error) {
      console.log("Error fetching book from Open Library:", error);
      return res.status(503).send("Unable to verify book. Open Library service unavailable.");
    }
    key.push(`image_url = $${++params}`);
    value.push(book_url);
  }

  if(req.body.rating !== undefined){
    const rating = parseFloat(req.body.rating);
    if(isNaN(rating) || rating < 1 || rating > 10){
      return res.status(400).send("Rating must be a number between 1 and 10");
    }
    key.push(`rating = $${++params}`);
    value.push(rating);
  } 
  if(req.body.summary !== undefined){
    const summary = req.body.summary;
    if (typeof summary !== 'string' || summary.trim() === "") {
      return res.status(400).send("Summary cannot be empty");
    }
    key.push(`summary = $${++params}`);
    value.push(summary);
  }

  if(params ===0){
    return res.status(400).send("No fields to update");
  }

  let query = `UPDATE summary SET ${key.join(", ")} WHERE id = $${++params} RETURNING *`;
  value.push(id);
  try {
    const result = await db.query(query, value);
    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    }
    res.status(200).send(result.rows[0]);
  } catch (error) {
    res.status(500).send("Error updating book");
  }
})

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("DELETE FROM summary WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send("Error deleting book");
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
