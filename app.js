const express = require ('express');
const app = express();
const routes = require('./routes/routes');


// Middleware to parse JSON
app.use(express.json());

// Routes
app.use(routes);

const port = process.env.PORT || 3000;

app.listen (port , () => {
    console.log(`Server running on port ${port}`);
});