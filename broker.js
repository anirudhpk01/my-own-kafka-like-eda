// consumer.js
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = path.join(__dirname, 'events.log');
const axios = require('axios');

let lastSize = 0;

function watchLogFile() {
  fs.watchFile(logPath, { interval: 500 }, (curr, prev) => {
    if (curr.size > prev.size) {
      const stream = fs.createReadStream(logPath, {
        start: lastSize,
        end: curr.size
      });

      const rl = readline.createInterface({ input: stream });

      rl.on('line', line => {
        const [offset, json] = line.split(/ (.+)/);
        const data = JSON.parse(json);
        //mailbox service
        //for each line, mailbox service to find which topic it should go to , and send it to that topic

        //so we figure out which topic it should go to, and so we send it to a particular api maybe

        //in this api, we may need to keep track of all the IPs or ports or final endpoints 
        //to which we need to send that message which could be something like a map function for each
        //of the receivers of that topic

        //that api can do a lookup for who are the people subcribed to that topic, and then 
        //send over the messages to each of those members
        
        axios.post('http://localhost:3000/api/mailbox', {
            offset,
            message: data
        })
        .then(response => {
            console.log(`Message sent to mailbox service: ${response.data}`);
            })
        .catch(error => {
            console.error(`Error sending message to mailbox service: ${error.message}`);
        });
        console.log(`!!! New message [offset ${offset}]:`, data);
      });

      rl.on('close', () => {
        lastSize = curr.size;
      });
    }
  });

  console.log(` Broker  listening to logs at ${logPath}`);
}

watchLogFile();
