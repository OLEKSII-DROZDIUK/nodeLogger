//master
const app = require('express')();
const express = require('express');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const path = require('path');
const base64Img = require('base64-img');
const bodyParser = require('body-parser');
server.listen(3000);

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

const SerpWow = require('google-search-results-serpwow');
let serpwow = new SerpWow('2F28ED8C78724A2A9BD6121B9DFAA4B8');
let logsConnect = path.join(__dirname, "./public/logs/connect.log");
let logsData = path.join(__dirname, "./public/logs/data.log");
let idImg;
let connectOS = "user OS not found";
let connectBrow = "user browser not found";
let ipConnect = "0.0000.000";

getTime = () => {
    let d = new Date();

    let convertMonth = (index) => {
        const month =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

        return month[index];
    }

    let datestring = ("0" + d.getDate()).slice(-2) + "/" + convertMonth(d.getMonth())
    + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) 
    + ":" + ("0" + d.getSeconds()).slice(-2);

    return "[" + datestring + "]";
}

io.on('connection', function (socket) {
    ipConnect = socket.conn.remoteAddress

    socket.on('sendToServer', async function (data) { 
        try {
            if(data[1] === "JSON") {
                async function getResult() {
    
                    let result = await serpwow.json({
                        q: JSON.parse(data[0]).query,
                        google_domain: 'google.com',
                    });
                    
                    return result.search_information.total_results;
                }
    
                let takeJson = new String(await getTime() + " " + ipConnect + " " + connectBrow + " (" + connectOS + ")" + " – New JSON: " + data[0] + ", About " + await getResult() + " results.");
                fs.appendFileSync(logsData, takeJson + "\n");
    
            } else if(data[1] === "rawData"){
                let takeRawData = new String(await getTime() + " " + ipConnect + " " + connectBrow + " (" + connectOS + ")" +  " – New RAW: " + data[0]);
                fs.appendFileSync(logsData, takeRawData + "\n");
    
            } else if(data[1] === "base64") {
                let imgFileName = Math.round(Math.random() * 100);
    
                await base64Img.img(data[0], 'public/img', imgFileName , async function(err, filepath) {
                    let takeBase64 = new String(await getTime() + " " + ipConnect + " " + connectBrow + " (" + connectOS + ")" + 
                     " – New Image: localhost:3000/img/" + imgFileName + ".png");
                    fs.appendFileSync(logsData, takeBase64 + "\n");
                });
            }
            socket.emit('sendStatusClient', 200);
        }
        catch (e) { 
            socket.emit('sendStatusClient', e.code);  //send error code to agent client (!=200)
        }        
    });
});

app.get('/', function (req, res) {
    idImg = "";

    res.render('pages/index', {
        idImg
    });

    const dataFromBrowser = require('ua-parser').parse(req.headers['user-agent']);

    connectBrow = dataFromBrowser.ua.toString();
    connectOS = dataFromBrowser.os.toString();
    
    fs.appendFileSync(logsConnect, getTime() + " " + ipConnect + " " + connectBrow + " (" + connectOS + ") – New connection \n");

});

app.get('/img/:id', function (req, res) {  //go to img
    idImg = req.params.id;
    
    res.render('pages/index', {
        idImg
    });
});
