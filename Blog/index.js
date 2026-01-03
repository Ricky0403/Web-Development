import express from "express";
import bodyParser from "body-parser";
import multer from "multer";

const app = express();
const port = 3000;

let title = [];
let images = [];
let content = [];

app.set("view engine", "ejs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req, res)=>{
    res.render("index.ejs", { title: title, content: content, images: images, currentPage: 'home' });
})

app.get("/home", (req, res)=>{
    res.render("index.ejs", { title: title, content: content, images: images, currentPage: 'home' });
})

app.get("/about", (req, res)=>{
    res.render("about.ejs", { currentPage: 'about' })
})

app.get("/create", (req, res)=>{
    res.render("create.ejs", { currentPage: 'create' })
})

app.post("/submit", upload.single('image-upload'), (req, res)=>{
    title.push(req.body['title']);
    content.push(req.body['content']);
    images.push(req.file ? req.file.filename : null);
    console.log(title);
    console.log(content);
    console.log(images);
    res.redirect("/");
})

app.get("/blog/:id", (req, res)=>{
    const id = req.params.id;
    if(id>=0 && id<title.length){
        res.render("blog.ejs", { title: title[id], content: content[id], image: images[id], currentPage: 'blog' });
    }
    else{
        res.status(404).send("Blog post not found");
    }
})

app.listen(port, ()=>{
    console.log(`Website running on port ${port}`);
})