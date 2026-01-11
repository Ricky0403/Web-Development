import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { convertCountryName } from 'country-code-converter';

const app = express();
const PORT = 3000;
const LOCATION_API_URL = "https://api.geoapify.com/v1/geocode/search";
const LOCATION_API_KEY = "a6f652717cbe4911b68ef05851ae434c";
const ALTITUDE_API_URL = "https://api.open-meteo.com/v1/elevation";
const UV_API_URL = "https://api.openuv.io/api/v1/uv";
const UV_API_KEY = "openuv-1d5xrmk7tvmn8-io";
const now = new Date();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {content: "Insert address"});
})

app.post("/submit", async (req, res) => {
    const countryCode = convertCountryName(req.body.country).ISO2.toLowerCase();
    const pin = parseInt(req.body.pin);
    try{
        const response = await axios.get(`${LOCATION_API_URL}?postcode=${pin}&filter=countrycode:${countryCode}&limit=10&lang=en&format=json&apiKey=${LOCATION_API_KEY}`);
        const lat = response.data.results[0].lat;
        const lon = response.data.results[0].lon;
        const response2 = await axios.get(`${ALTITUDE_API_URL}?latitude=${lat}&longitude=${lon}`);
        const alt = response2.data.elevation[0];
        const isoString = now.toISOString()
        const UVresponse = await axios.get(UV_API_URL, {
            params:{
                lat: lat,
                lng: lon,
                alt: alt,
                dt: isoString
            },
            headers: {
                'x-access-token': UV_API_KEY
            }
        });
        console.log(UVresponse.data);
        res.status(200).render("index.ejs", {data: UVresponse.data.result});
    }catch(error){
        res.status(500).render("index.ejs", {content: JSON.stringify(error.response.data)});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})