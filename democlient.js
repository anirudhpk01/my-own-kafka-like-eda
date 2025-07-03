const express = require('express');

const app = express();
app.use(express.json());


app.post('/eda/api/receive', (req, res) => {
  const { offset, message } = req.body;
    console.log(`📬 Received message at offset ${offset}:`, message)
});
   

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Client running at http://localhost:${PORT}`);
});