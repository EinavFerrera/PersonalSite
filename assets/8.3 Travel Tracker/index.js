import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "4123",
  port: 5432,
});

db.connect();

async function getCountry() {
  let code_list = [];
  let temp = await db.query("SELECT country_code FROM visited_countries");
  temp.rows.forEach((code) => {
    code_list.push(code.country_code);
  });
  return code_list;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  let list = [];
  list = await getCountry();
  res.render("index.ejs", { total: list.length, countries: list });
});
app.post("/add", async (req, res) => {
  try {
    let new_county_code = await db.query(
      "SELECT country_code FROM countries WHERE country_name = $1",
      [req.body.country]
    );
    const data = new_county_code.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (error) {
      const list = await getCountry();
      res.render("index.ejs", {
        total: list.length,
        countries: list,
        error: "This country is already in the list",
      });
    }
  } catch (error) {
    const list = await getCountry();
    res.render("index.ejs", {
      total: list.length,
      countries: list,
      error: "Sorry, No such country",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
