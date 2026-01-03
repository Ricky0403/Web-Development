/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/
import inquirer from "inquirer";
import { image } from "qr-image";
import { createWriteStream } from "fs";
import { writeFile } from "fs";


const question = [{
    type:'input',
    name: 'websiteName',
    message :'Enter website URL'
}]

const website = await inquirer.prompt(question);
var qr = image(website['websiteName'], {type:'png'});

qr.pipe(createWriteStream("QR Generated.png"));

writeFile("new URL.txt", website['websiteName'], (err)=>{
    if(err) throw err;
    console.log("file saved");
});
console.log(website['websiteName']);