//To see how the final website should work, run "node solution.js".
//Make sure you have installed all the dependencies with "npm i".
//The password is ILoveProgramming
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
const password = "ILoveProgramming";
app.use(bodyParser.urlencoded({extended:true}));

var result = false;
function isCorrect(req, res, next){
    if(req.body.password===password){
        result = true;
    }
    next();
}

app.use(isCorrect);

app.get("/",(req, res)=>{
    res.sendFile(__dirname+"/public/index.html");
});

app.post("/check", (req,res)=>{
    if(result){
        res.sendFile(__dirname+"/public/secret.html");
    }
    else{
        res.redirect("/");
    }
});

app.listen(port, ()=>{
    console.log("Listening to port "+port);
});