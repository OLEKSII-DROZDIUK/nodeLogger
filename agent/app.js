//agent
const io = require('socket.io-client');
const socket = io.connect("http://localhost:3000/", {
    reconnection: true
});
const base64Img = require('base64-img');
const openWeb = require('open');

let json = '{ "type": "test", "query": "Node.js" }';
let rawData = "Test here!";
let imgBase64 = base64Img.base64Sync('./public/img/blog.png');

let currendSendData;
let intervalDataConnect;
let intervalDataDisconnect;
let reconnectTriger;

let getRandomData = () => {
    const randomData = [json, rawData, imgBase64];
    let randomIndexArr = randomData[Math.floor(Math.random() * randomData.length)];

    const typeOfData = () => {
        if(randomIndexArr === json){
            return "JSON"
        } else if(randomIndexArr === rawData){
            return "rawData"
        } else if(randomIndexArr === imgBase64){
            return "base64"
        }
    };
    return [randomIndexArr, typeOfData()];
}

function runRepeatSendData() {
    intervalDataDisconnect = setInterval(() => {
        socket.emit('sendToServer', currendSendData);
    }, 1000);
}

setTimeout(() => {
    openWeb('http://localhost:3000/');
}, 500);

socket.on('connect', function () {
    reconnectTriger = true;
    console.log('connected to localhost:3000', socket.connected);
    clearInterval(intervalDataDisconnect);

    intervalDataConnect = setInterval( async() => {

        currendSendData = getRandomData();   
        socket.emit('sendToServer', currendSendData);
        
        socket.on('sendStatusClient', function (data) {
            if(data != 200) {
                clearInterval(intervalDataConnect);
                runRepeatSendData();
            }
        });
    }, 3000);
});

socket.on('disconnect', function() {
    reconnectTriger = false;
    console.log('Server disconnect, ERROR: ', !socket.connected);
    clearInterval(intervalDataConnect);
});

let reconnectServer = setInterval(() => {   //imitation server shutdown

    if(reconnectTriger){
        socket.disconnect();
    } else {
        socket.connect();
    }
},5000)
