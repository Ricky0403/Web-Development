import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', async(req, res) => {

  const filter = req.query.filter || 'date';  
  try{
    const response = await axios.get(`${API_URL}/all-${filter}`);
    console.log(response.data);
    res.status(200).render('index', { books: response.data });
  } catch (error) {
    res.status(500).send("Error fetching books", error);
  }
  
});

app.post("/add-book", async (req, res) => {
  const { title, author, rating, summary } = req.body;
    try{
      const response = await axios.post(`${API_URL}/add`, 
        {
          title,
          author,
          rating,
          summary
        });
      res.status(200).send(response.data);
    } catch (error) {
      res.status(400).send("Please check all inputs and try again");
   }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});