const { Prisma } = require('@prisma/client');
const express = require('express');
const app = express();

require('dotenv').config()
 const connection = mysql.createConnection(process.env.DATABASE_URL)
// console.log('Connected to PlanetScale!')
// connection.end()


app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/', (req, res) => {
    res.json({msg:"Hello World"});
});

app.post('/user', async (req, res) => {
    const user = await Prisma.user.create({
        data: req.body
    });
    res.json(user);
});