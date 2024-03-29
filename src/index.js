const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const express = require('express');
const mysql = require('mysql')

const app = express();
const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')

const {getUser, getLocation, createUser, getRequest, createRequest, CheckDistance, getIndexStop, UpdateNotification, CheckNextStop, CancelRequest} = require('./database.js')
require('dotenv').config()

app.use(express.json());
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

app.get('/', (req, res) => {
    res.send('Welcome to BusBuddy API!');
});
// Rutas de usuarios
// app.get('/users', async(req, res) => {
//     const users = await prisma.Usuarios.findMany();
//     res.json({users});
// });

app.post('/FindUser', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.usuarios.findFirst({
      where: {
        email: email,
        password: password
        }
    }); 
    res.json(user);
  });

  app.get('/findLocation/:latlng', async (req, res) => {
    const { latlng } = req.params;
    const location = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng + "&key=" + process.env.API_KEY;
    
    fetch(location)
      .then(response => response.json())
      .then(data => {
        // console.log(data);
        res.json(data.results[0].formatted_address);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
      });
  });
  

app.get('/user/:id', async (req, res) => {
    const  id = req.params.id;
    const user = getUser(id).then((user) => {
        if(user){
            res.json(user);
        }
        else{
            res.json(null);
        
}   
})
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


app.post('/CreateUser', async (req, res) => {
    const user = await createUser(req.body).then((user) => {    
        if (user){
                res.json(user);
        }
        else{
            res.json({msg: "User not created"});
        }

    })
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

// Rutas de lineas

app.get('/lineas', async(req, res) => {
    const lineas = await Prisma.Lineas.findMany(
        {
            include: {
                colectivos: true,
            }
        }
    );
    
    res.json({lineas});
});

app.get('/lineas/:id', async (req, res) => {
    const { id } = req.params;
    const linea = await prisma.Lineas.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            colectivos: true,
            paradas: true,
        }
    });
    res.json(linea);
});

app.get('/Findlinea/:nro', async (req, res) => {
    const { nro } = req.params; 
    const lineas = await prisma.Lineas.findUnique({
        where: {
            linea: parseInt(nro)
        }        
    });
    if (lineas){
    res.json(lineas.id);
    }
    else{
        res.json(null);
    }
});

app.post('/Crearlinea', async(req, res) => {
    const linea = await prisma.Lineas.create({
        data: req.body,
    });
    res.json(linea);
});

// Rutas de Colectivos
app.post('/colectivos/:id', async(req, res) => {
    const { id } = req.params;
    const parada = await prisma.Colectivo.create({
        data: req.body,
    });
    res.json(parada);
});

// Rutas de Paradas

app.post('/CreateParadas/:id', async(req, res) => {
    const { id } = req.params;
    var data = req.body;
    data.id_linea = parseInt(id);
    const parada = await prisma.Paradas.create({
        data: data
    });
    res.json(parada);
});

async function addParadas(direccion, latitude, longitude, id_linea){
    latitude = String(latitude);
    longitude = String(longitude);
    const creacion = fetch("http://localhost:3001/CreateParadas/" + id_linea, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            latitud: latitude,
            longitud:longitude,
            direccion: direccion
    
        })
        }).then(response => response.json())
        .then(response => {
            console.log(response);
        });

    return creacion;
    }

// addParadas("2833 RIVADAVIA AV.",-34.610177,-58.406543,2);

app.get('/GetParadas', async(req, res) => {
    var resumen = [];
    const paradas = getParadas().then((paradas) => {
    // resumen.push(paradas);
    res.json(paradas);
    });
    
});


async function getParadas(){
    var IDParada = [];
    const parada = await prisma.Paradas.findMany();
    parada.forEach(function(value, index, array){
    IDParada.push(value.id);
    });
    const randomIndex = Math.floor(Math.random() * IDParada.length);
    var paradaInicio = IDParada[randomIndex];
    var paradaFin = IDParada[randomIndex + 3];
    if (paradaFin == undefined){
        paradaFin = IDParada[randomIndex - 3];
    }
    // console.log(paradaInicio + " " + paradaFin);
    return [paradaInicio, paradaFin];
}
getParadas();
 
app.post('/CheckDistance', async(req, res) => {
    const { lati, longi } = req.body;
    try {
    const BusNoti = await CheckDistance(parseFloat(lati), parseFloat(longi));
    if (BusNoti) {
        res.json(BusNoti);
    } else {
        res.json(BusNoti);
    }
  } catch (error) {
    console.error("Error al buscar la parada más cercana:", error);
  }
    }
);

app.post('/DeleteSolicitud', async(req, res) => {
    const { id} = req.body;
    try {
        const deleteRequest = await CancelRequest(id);
        if (deleteRequest) {
            res.json(deleteRequest);
        } 
        } catch (error) {
            console.error("Error al eliminar la solicitud:", error);
        }
}
);
    

app.get('/paradas/:id_linea', async(req, res) => {
    const { id_linea } = req.params;
    const parada = await prisma.Paradas.findMany({
        where: {
            id_linea: parseInt(id_linea)
        }
    });
    res.json(parada);
});


// Rutas de solicitudes

app.post('/CreateSolicitud/', async(req, res) => {
    const solicitud = await prisma.Solicitudes.create({
        data: req.body,
    });
    const update = await prisma.Usuarios.update({
        where: {
            id: parseInt(solicitud.id_usuario)
        },
        data: {
            bajarse: 0,
        }
    });
    console.log(update)
    res.json(solicitud.id);
});

app.get('/solicitudes', async(req, res) => {
    const solicitudes = await prisma.Solicitudes.findMany();
    res.json({solicitudes});
});

app.get('/solicitudes/:id', async(req, res) => {
    const { id } = req.params;
    const solicitudes = getRequest(id).then((solicitudes) => {
    res.json(solicitudes);
})
});

app.post('/AddFavorite', async(req, res) => {
    const { id_usuario, direccionOrigen, direccionDestino, nombre } = req.body;
    const solicitud = await prisma.Favoritos.create({
        data: {
            id_usuario: parseInt(id_usuario),
            nombre: nombre,
            direccionOrigen: direccionOrigen,
            direccionDestino: direccionDestino
        },
    });
    res.json(solicitud);
}

);

app.post('/GetFavorite', async(req, res) => {
    const { id_usuario } = req.body;
    const solicitud = await prisma.Favoritos.findMany({
        where: {
            id_usuario: parseInt(id_usuario)
        }
    });
    if(solicitud){
        res.json(solicitud);
    }
    else{
        res.json(null);
    }
}
);

app.post('/DeleteFavorite', async(req, res) => {
    const { id } = req.body;
    const solicitud = await prisma.Favoritos.delete({
        where: {
            id: parseInt(id)
        }
    });
    res.json(solicitud);
}
);


app.get('/AllStops', async(req,res) => {
    const stops = await prisma.Paradas.findMany();
    res.json(stops);
})

module.exports = app;