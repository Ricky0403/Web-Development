import express from "express";


const app = express();
const port = 3000;
var week = "a weekday";
var advice = "it's time to work hard";
function whatDay(req, res, next){
    var day = new Date().getDay();
    if(day===6 || day===0){
        week = "the weekend";
        advice = "it's time to sleep hard"
    }
    console.log(week);
    next();
}

app.use(whatDay);

app.get("/",(req, res)=>{
    res.render("index.ejs", {dayType:week, advice:advice});
});

app.listen(port,()=>{
    console.log("Listening to port "+port);
});