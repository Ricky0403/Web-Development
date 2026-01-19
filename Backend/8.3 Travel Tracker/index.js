import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "Ricky@2004",
  port: 5432
});

db.connect();

app.get("/", async (req, res) => {
  //Write your code here.
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];

  result.rows.forEach(row => {
    countries.push(row.country_code);
  });
  console.log(result.rows);
  res.status(200).render("index.ejs", { countries:countries, total: countries.length });
});

app.post("/add", async (req, res) => {
  const country = req.body.country;
  const country_code = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [country]);
  if (country_code.rows.length === 0) {
    console.log("Country not found");
    return res.status(400).redirect("/");
  } else{
    await db.query("INSERT INTO visited_countries(country_code) VALUES ($1)", [country_code.rows[0].country_code]);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
