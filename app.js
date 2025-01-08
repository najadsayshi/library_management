const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myLibrary', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => console.log("MongoDB connection error:", error));

// Create a schema for books
const bookSchema = new mongoose.Schema({
    bookName: String,
    bookAuthor: String,
    bookPages: Number,
    bookPrice: Number,
    bookState: { type: String, default: "Available" }
});

// Create a model for books
const Book = mongoose.model('Book', bookSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Render the home page with all books from MongoDB
app.get("/", async (req, res) => {
    try {
        const books = await Book.find(); // Fetch all books from MongoDB
        res.render("home", { data: books });
    } catch (err) {
        res.status(500).send("Error fetching books.");
    }
});

// Add a new book to MongoDB
app.post("/", async (req, res) => {
    const { bookName, bookAuthor, bookPages, bookPrice } = req.body;

    const newBook = new Book({
        bookName,
        bookAuthor,
        bookPages,
        bookPrice
    });

    try {
        await newBook.save(); // Save the book to MongoDB
        const books = await Book.find(); // Fetch updated list of books
        res.render("home", { data: books });
    } catch (err) {
        res.status(500).send("Error adding book.");
    }
});

// Issue a book (update bookState to "Issued")
app.post('/issue', async (req, res) => {
    const requestedBookName = req.body.bookName;

    try {
        const book = await Book.findOne({ bookName: requestedBookName });
        if (book) {
            book.bookState = "Issued";
            await book.save(); // Save the updated book
        }
        const books = await Book.find(); // Fetch updated list of books
        res.render("home", { data: books });
    } catch (err) {
        res.status(500).send("Error issuing book.");
    }
});

// Return a book (update bookState to "Available")
app.post('/return', async (req, res) => {
    const requestedBookName = req.body.bookName;

    try {
        const book = await Book.findOne({ bookName: requestedBookName });
        if (book) {
            book.bookState = "Available";
            await book.save(); // Save the updated book
        }
        const books = await Book.find(); // Fetch updated list of books
        res.render("home", { data: books });
    } catch (err) {
        res.status(500).send("Error returning book.");
    }
});

// Delete a book from MongoDB
app.post('/delete', async (req, res) => {
    const requestedBookName = req.body.bookName;

    try {
        await Book.deleteOne({ bookName: requestedBookName }); // Delete book from MongoDB
        const books = await Book.find(); // Fetch updated list of books
        res.render("home", { data: books });
    } catch (err) {
        res.status(500).send("Error deleting book.");
    }
});

app.listen(3000, () => {
    console.log("App is running on port 3000");
});
