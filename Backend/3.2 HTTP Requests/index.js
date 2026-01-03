import express from "express";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("<h1>Hello World<h1>");
})

app.get("/about", (req, res) => {
    res.send("<h2>I am Ricky<h2>");
})

app.get("/contact", (req, res) => {
    res.send("My phone no. is 67678787");
})
app.listen(port, () => {
    console.log(port);
});