const { Prisma } = require('@prisma/client');
const express = require('express');
const mysql = require('mysql2')

const app = express();

require('dotenv').config()
 const connection = mysql.createConnection(process.env.DATABASE_URL)
// console.log('Connected to PlanetScale!')
// connection.end()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/users', async(req, res) => {
    const users = await prisma.Usuarios.findMany();
    res.json({users});
});

app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    const user = await prisma.Usuarios.findUnique({
        where: {
            id: parseInt(id)
        }
    });
    res.json(user);
});

app.put('/user/:id', async (req, res) => {
    const { id } = req.params;
    const user = await prisma.Usuarios.update({
        where: {
            id: parseInt(id)
        },
        data: req.body
    });
    res.json(user);
});


app.post('/user', async (req, res) => {
    const user = await prisma.Usuarios.create({
        data: req.body
    });
    res.json(user);
});

app.delete('/user/:id', async (req, res) => {
    const { id } = req.params;
    const user = await prisma.Usuarios.delete({
        where: {
            id: parseInt(id)
        }
    });
    res.send({msg: "User deleted successfully"});
});