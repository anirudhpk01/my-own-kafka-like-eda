// producer.js
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { createClient } = require('redis');
const axios = require('axios');

const app = express();
app.use(express.json());

const logPath = path.join(__dirname, 'events.log');
const offsetPath = path.join(__dirname, 'events.offset');


// Ensure log and offset file exist
fs.ensureFileSync(logPath);
fs.ensureFileSync(offsetPath);

// Append message with offset
app.post('/api/produce', async (req, res) => {
  const message = req.body;

  let offset = 0;
  if (await fs.pathExists(offsetPath)) {
    const current = await fs.readFile(offsetPath, 'utf-8');
    offset = parseInt(current || '0', 10);
  }

  const entry = `${offset} ${JSON.stringify(message)}\n`;
  await fs.appendFile(logPath, entry);
  await fs.writeFile(offsetPath, String(offset + 1));

  res.json({ status: 'Message written', offset });
});




//Implementing a simple mailbox service

// const topicSubscribers = {
//   "user.signup": ["http://localhost:5001", "http://localhost:5002"],
//   "user.logout": ["http://localhost:5003"]
// };

// app.post('/mailbox', (req, res) => {
//   const { offset, message } = req.body;
//   const topic = message.event; // e.g., "user.signup"

//   const receivers = topicSubscribers[topic] || [];

//   if (receivers.length === 0) {
//     console.log(`❗ No subscribers for topic: ${topic}`);
//     return res.status(200).send(`No subscribers for ${topic}`);
//   }

//   // Send to all subscribers
//   receivers.forEach((url) => {
//     axios.post(`${url}/receive`, { offset, message })
//       .then(() => console.log(`✅ Delivered to ${url}`))
//       .catch((err) => console.error(`❌ Failed to deliver to ${url}:`, err.message));
//   });

//   res.send(`Forwarded message on topic '${topic}' to ${receivers.length} subscriber(s)`);
// });





// Redis setup
const redis = createClient();
redis.connect().then(() => console.log("🧠 Connected to Redis"));

app.post('/api/mailbox', async (req, res) => {
  const { offset, message } = req.body;
  const topic = message.event;

  // Get subscriber list from Redis
  const subscribers = await redis.sMembers(topic);

  if (!subscribers.length) {
    console.log(`❗ No subscribers for topic: ${topic}`);
    return res.status(200).send(`No subscribers for ${topic}`);
  }

  // Forward to each subscriber
  subscribers.forEach((url) => {
    axios.post(`${url}/eda/api/receive`, { offset, message })
      .then(() => console.log(`✅ Sent to ${url}`))
      .catch(err => console.error(`❌ Failed to send to ${url}: ${err.message}`));
  });

  res.send(`🔁 Sent message to ${subscribers.length} subscriber(s) for topic '${topic}'`);
});



app.post('/api/subscribe', async (req, res) => {
  const { topic, url } = req.body;

  if (!topic || !url) {
    return res.status(400).send('topic and url are required');
  }

  await redis.sAdd(topic, url);
  res.send(`✅ Subscribed ${url} to topic '${topic}'`);
});











const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Producer running at http://localhost:${PORT}`);
});
