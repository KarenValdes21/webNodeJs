const mysql =require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'supermarket'
});

connection.connect((error)=>{
    if(error){
        console.log('Error en la conexion: ' +  error);
        return;
    }
    console.log('Conectado a la BD!!');
})

module.exports = connection;