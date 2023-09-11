// const mysql = require('mysql2');

const mysql = require('mysql');

require('dotenv').config()
// import browserEnv from 'browser-env';
require('browser-env')(['window', 'document', 'navigator']);


const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')
// connection.end()

const { PrismaClient } = require('@prisma/client');
const { parse } = require('dotenv');
const prisma = new PrismaClient()

async function getUser(id){
    const user = await prisma.Usuarios.findUnique({
        where: {
            id: parseInt(id)
        }
        });
    return user
}
async function CheckDistance(lati, longi) {
    try {
      const response = await fetch("https://breakable-turtleneck-shirt-foal.cyclic.app/paradas/2", {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      const AllCoords = data.map(parada => [parseFloat(parada.latitud), parseFloat(parada.longitud)]);
  
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radio de la Tierra en kilómetros
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
        };
  
      const targetLat = parseFloat(lati);
      const targetLong = parseFloat(longi);
  
      let closestCoord = null;
      let closestDistance = Infinity;
  
      for (const [coordLat, coordLong] of AllCoords) {
        const distance = calculateDistance(targetLat, targetLong, coordLat, coordLong);
  
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCoord = [coordLat, coordLong];
        }
      }
       const IndexStop = await getIndexStop(closestCoord);
       return IndexStop;
    } catch (error) {
      console.error("Error al obtener coordenadas:", error);
      return null;
    }
  }

async function getIndexStop(closestCoord){
    var lat = String(closestCoord[0]);
    var long = String(closestCoord[1]);
    while(lat.length < 10){
        lat = lat + "0";
    }
    while(long.length < 10){
        long = long + "0";
    }
    const index = await prisma.Paradas.findFirst({
        where: {
            latitud: lat,
            longitud: long
        },        
        select: {
            id: true
        }
        });
    FindNextStop = await CheckNextStop(index.id);
    return FindNextStop

}

async function CheckNextStop(id){
    nextStop = parseInt(id) + 1;
    if(nextStop > 29){
        nextStop = parseInt(id) - 1;
    }
    const search = await prisma.Solicitudes.findFirst({
        where: {
            paradaInicio: nextStop,
        },
        select: {
            id: true,
            paradaInicio: true,
        }
    });
    var sumar = true;
    if (search){
        console.log("Hay una solicitud ("+search.id+") en la parada siguiente: " + search.paradaInicio);
        const update = await UpdateNotification("3056", search.paradaInicio, sumar);
        return 1
    }
    else{
        sumar = false;
        const update = await UpdateNotification("3056", 0, sumar);
        return 0
    }
}

// SI SUMAR ES TRUE, SUMA UNO A LA NOTIFICACION, SI ES FALSE, LA PONE EN 0
async function UpdateNotification(interno, stop, sumar){
    if(sumar){
    const update = await prisma.colectivo.update({
        where: {
            interno: interno
        },
        data: {
            notificar: 1,
            paradaSolicitada: stop,
        }
    });
    console.log(update);
}
else{
    const update = await prisma.colectivo.update({
        where: {
            interno: interno
        },
        data: {
            notificar: 0,
            paradaSolicitada: 0,
        }
    });
    console.log(update);
}
}

async function CancelRequest(id, interno, paradaInicio){
    const deleteRequest = await prisma.Solicitudes.delete({
        where: {
            id: parseInt(id)
        }
    });
    const update = await UpdateNotification(interno, paradaInicio, false);
    return deleteRequest
}


async function createUser(user){
    try{
    const newUser = await prisma.Usuarios.create({
        data: user
    });
    if (newUser){
        console.log('User created')
        return newUser
    }
}
    catch (e)
    {
        console.log('User not created:' + e)
    }
    
}

async function getRequest(id){
    const request = await prisma.Solicitudes.findUnique({
        where: {
            id: parseInt(id)
        },        
        select: {
            linea: true,
            usuario: true,
            parada: true,
        }
        });
    return request
}

async function createRequest(request){
    const newRequest = await prisma.Solicitudes.create({
        data: parse(request)
    });

    return newRequest
}



module.exports = { getUser, createUser, getRequest, createRequest, CheckDistance, getIndexStop, UpdateNotification, CheckNextStop, CancelRequest}