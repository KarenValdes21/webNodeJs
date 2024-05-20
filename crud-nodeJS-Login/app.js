const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();

app.use(session({
    secret: 'ASDJK1ni2uJHnoioz448ass-ASD2ja',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(express(express.json));
app.use('/', require('./router'));

app.listen(5005, ()=>{
    console.log('SERVER DE KAREN CORRIENDO en http://127.0.0.1:5005')
});

