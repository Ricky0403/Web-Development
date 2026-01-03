const fs = require("fs");

// fs.writeFile("messages.txt","Hello from Node JS", (err)=>{
//     if(err) throw err;
//     console.log("The file have been saved!");
// });

fs.readFile("messages.txt","utf8",(err, data)=>{
    if(err) throw err;
    console.log(data);
});