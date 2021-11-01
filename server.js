const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();

// Express.js middleware functions
app.use(express.urlencoded({extended:false}));
app.use(express.json());



// default response for any other request (not found)
app.use((req,res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server now running on port ${PORT}`);
});