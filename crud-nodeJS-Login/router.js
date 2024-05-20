const express = require('express');
const bcrypt = require('bcrypt');
const router = express();

const connection = require('./database/database');

/**
 * HOME
 */// Asegúrate de que 'connection' está exportado desde el archivo db.js


// Página de inicio
router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', { var1: 'Hola' });
    } else {
        res.redirect('/login');
    }
});

// Página de login
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
      connection.query('SELECT * FROM usuario WHERE username = ? AND contraseña = ?', [username, password], (error, results, fields) => {
          if (error) {
              console.error('Error en la consulta:', error.message);
              res.status(500).send('Error en el servidor');
              return;
          }

          if (results.length > 0) {
              
                      req.session.loggedin = true;
                      req.session.username = username;
                      req.session.user_id = results[0].id;
                      res.redirect('/');
                
              
          } else {
              res.send('Usuario o contraseña incorrectos.');
          }
      });
  } else {
      res.send('Por favor, ingrese el nombre de usuario y la contraseña.');
  }
});


// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

/**
 * CLIENTES
 */
router.get('/clientes', (req, res)=>{
    if (!req.session.loggedin) {
      res.redirect('/login');
      return;
    }
    connection.query('SELECT id, ClienteID, fechaCrea FROM cliente', (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('clientes', {results: results});
        }
    })
})

// Eliminar
router.get('/clientes/:id', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const id_data = req.params.id;
    const sql = 'CALL SP_EliminarCliente(?)';
    connection.query(sql, [id_data], (error, results) => {
        if (error) {
            console.error('Error al ejecutar el stored procedure: ' + error.message);
            return;
        }
        console.log('El registro ha sido eliminado exitosamente');
        res.redirect('/clientes');
    });
});

router.get('/clientes/:id/data', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const id_data = req.params.id;
    connection.query('SELECT id, ClienteID, idUsuarioModifica FROM cliente WHERE estatus = 1 AND id = ?', [id_data], (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('editar_cliente', { row: results }); //
        }
    })
})

router.post('/cliente_add', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const ClienteID = req.body.ClienteID;
    const IdUsuarioCrea = req.session.user_id;//req.body.IdUsuarioCrea;
    const sql = 'CALL SP_AgregarCliente(?, ?)';
    connection.query(sql, [ClienteID, IdUsuarioCrea], (error, results) => {
      if (error) {
        console.error('Error al ejecutar el stored procedure: ' + error.message);
        return;
      }
      console.log('Datos insertados correctamente');
    
      res.redirect('/clientes');
    });
  });

  router.post('/cliente_update', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/login');
      return;
    }
    const id = req.body.id;
    const ClienteID = req.body.clienteID;
    const IdUsuarioCrea = req.session.user_id;//req.body.modifica;
    const sql = 'CALL SP_EditarCliente(?, ?, ?)';
    connection.query(sql, [id, ClienteID, IdUsuarioCrea], (error, results) => {
      if (error) {
        console.error('Error al ejecutar el stored procedure: ' + error.message);
        return;
      }
      console.log('Datos Modificados correctamente');
    
      res.redirect('/clientes');
    });
  });

module.exports = router;




/**
 * PEDIDOS
 */
router.get('/pedidos', (req, res)=>{
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    connection.query('SELECT id, PedidoID, Precio, Cantidad, Descuento, Ganancia, OrdenFecha,EnvioFecha, ModoEnvio, idUsuarioModifica FROM pedido WHERE estatus = 1', (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('pedidos', {results: results});
        }
    })
})

// Eliminar
router.get('/pedidos/:id', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const id_data = req.params.id;
    const sql = 'CALL SP_EliminarPedido(?)';
    connection.query(sql, [id_data], (error, results) => {
        if (error) {
            console.error('Error al ejecutar el stored procedure: ' + error.message);
            return;
        }
        console.log('El registro ha sido eliminado exitosamente');
        res.redirect('/pedidos');
    });
});

router.get('/pedidos/:id/data', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const id_data = req.params.id;
    connection.query('SELECT PedidoID, Precio, Cantidad, Descuento, Ganancia, OrdenFecha, EnvioFecha, ModoEnvio, idUsuarioModifica FROM pedido WHERE estatus = 1 AND id = ?', [id_data], (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('editar_pedido', { row: results }); //
        }
    })
})

router.post('/pedidos_add', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const idPedido = req.body.idPedido;
    const precio = req.body.precio;
    const cantidad = req.body.cantidad;

    const descuento = req.body.descuento;
    const ganancia = req.body.ganancia;
    const fechaPedido = req.body.fechaPedido;
    const fechaEnvio = req.body.fechaEnvio;
    const modoEnvio = req.body.modoEnvio;
    // Llamar al stored procedure para insertar los datos en la base de datos
    const sql = 'CALL SP_AgregarPedido(?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [idPedido, precio, cantidad, descuento, ganancia, fechaPedido, fechaEnvio, modoEnvio], (error, results) => {
      if (error) {
        console.error('Error al ejecutar el stored procedure: ' + error.message);
        return;
      }
      console.log('Datos insertados correctamente');
    
      res.redirect('/pedidos');
    });
  });

  router.post('/pedidos_update', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/login');
      return;
    }
    const idPedido = req.body.idPedido;
    const precio = req.body.precio;
    const cantidad = req.body.cantidad;
    const descuento = req.body.descuento;
    const ganancia = req.body.ganancia;
    const fechaEnvio = req.body.fechaEnvio;
    const fechaPedido = req.body.fechaPedido;
    const modoEnvio = req.body.modoEnvio;
    const idUsuarioModifica = req.session.user_id;//req.body.idUsuarioModifica;
    const sql = 'CALL SP_EditarPedido(?, ?, ?, ?, ?, ?, ?, ?, ?)';

    connection.query(sql, [idPedido, precio, cantidad, descuento, ganancia, fechaEnvio, fechaPedido, modoEnvio, idUsuarioModifica], (error, results) => {
      if (error) {
        console.error('Error al ejecutar el stored procedure: ' + error.message);
        return;
      }
      console.log('Datos Modificados correctamente');
    
      res.redirect('/pedidos');
    });
  });





/**
 * PRODUCTOS
 */
router.get('/productos', (req, res)=>{
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    connection.query('SELECT ProductoID, NombreProducto, idSubcategoria, fechaCrea, idUsuarioModifica FROM producto WHERE estatus = 1', (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('productos', {results: results});
        }
    })
})
// Eliminar
router.get('/productos/:id', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const id_data = req.params.id;
    const sql = 'CALL SP_EliminarProducto(?)';
    connection.query(sql, [id_data], (error, results) => {
        if (error) {
            console.error('Error al ejecutar el stored procedure: ' + error.message);
            return;
        }
        console.log('El registro ha sido eliminado exitosamente');
        res.redirect('/productos');
    });
});

router.get('/productos/:id/data', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const id_data = req.params.id;
    connection.query('SELECT ProductoID, NombreProducto, idUsuarioModifica FROM producto WHERE estatus = 1 AND ProductoID = ?', [id_data], (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('editar_producto', { row: results }); //
        }
    })
})

router.post('/productos_add', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
    const ProductoID = req.body.ProductoID;
    const NombreProducto = req.body.NombreProducto;
    const IdUsuarioCrea = req.session.user_id;//req.body.IdUsuarioCrea;
    const sql = 'CALL SP_AgregarProducto(?, ?, ?)';
    connection.query(sql, [ProductoID, NombreProducto, IdUsuarioCrea], (error, results) => {
      if (error) {
        console.error('Error al ejecutar el stored procedure: ' + error.message);
        return;
      }
      console.log('Datos insertados correctamente');
    
      res.redirect('/productos');
    });
  });


  router.post('/productos_update', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/login');
      return;
    }
    const ProductoID = req.body.id;
    const NombreProducto = req.body.nombre;
    const IdUsuarioCrea = req.session.user_id;//req.body.modifica;
    const sql = 'CALL SP_EditarProducto(?, ?, ?)';
    connection.query(sql, [ProductoID, NombreProducto, IdUsuarioCrea], (error, results) => {
      if (error) {
        console.error('Error al ejecutar el stored procedure: ' + error.message);
        return;
      }
      console.log('Datos Modificados correctamente');
    
      res.redirect('/productos');
    });
  });


module.exports = router;