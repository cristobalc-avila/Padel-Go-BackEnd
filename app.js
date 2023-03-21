var express = require('express');
const mysql = require('mysql')
const bodyParser = require('body-parser');
var bcrypt=require('bcrypt');
var jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const cors = require("cors")
var visitas = 0

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//EMAIL
const OAuth2 = google.auth.OAuth2
const CLIENT_ID = "884556618082-ir4cqhbbnq8rhdkofv8pp11qvaiomsqk.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground/";
const REFRESH_TOKEN = "1//04_G74BPNmPA9CgYIARAAGAQSNwF-L9IrtKxWavjajkaSvxsDRr_04jk1pEnVS_pL39l9Bz7sQyO9C_TpcSUYHnonUgiOKUUIkhg";

const oauth2Client = new OAuth2(
    CLIENT_ID.
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const accessToken = oauth2Client.getAccessToken;

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "padel.go.cli@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
    }
});


//CORS
/*
app.use(function(req,res,next){
    //Access-Control-Allow-Origin
    res.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS")
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type,Accep,x-client-key,x-client-token,x-client-secret,Authorization")
    next()
})
*/
app.use(cors());

const mc = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gopadel'
});

mc.connect();

app.get('/view',function (req,res){
    visitas++
    console.log(visitas)
    return res.send("")
})

//Agregar un usuario
app.post('/usuario',function(req,res){
    console.log(req.body.rut);
    let datosUsuario={
        rut:req.body.rut,
        nombre:req.body.nombre,
        apellido:req.body.apellido,
        sexo:req.body.sexo,
        correo:req.body.correo,
        clave:bcrypt.hashSync(req.body.clave,10),
        nivel:req.body.nivel
    };
    if(mc){
        mc.query("INSERT INTO usuarios SET ?",datosUsuario,function(error,result){
            if(error){
                return res.status(400).json({
                    ok:false,mensaje:'Error a crear usuario',error:error
                })
            }else{
                res.status(201).json({
                    ok:true,usuario:result
                })
                let msg= `<h3><span>Cuenta de Padel GO!</span></h3>
                            <p>Hola `+datosUsuario.nombre+`!</p>
                            <p>Tú cuenta de Padel Go se ha creado exitosamente</p>
                            <p>Tús datos son:</p>
                            <p>Rut: `+datosUsuario.rut+`</p>
                            <p>Nombre: `+datosUsuario.nombre+`</p>
                            <p>Apellido: `+datosUsuario.apellido+`</p>
                            <p>Sexo: `+datosUsuario.sexo+`</p>`;

                const mailOptions= {
                    from: "PADEL GO <padel.go.cli@gmail.com>",
                    to: datosUsuario.correo,
                    subject: "Cuenta Creada",
                    generateTextFromHTML: true,
                    html: msg
                }

                smtpTransport.sendMail(mailOptions, (error, response) => {
                    error ? console.log(error) : console.log(response);
                    smtpTransport.close();
                })
            }
        });
    }
});

app.post('/login',function(req,res){
    var body=req.body;
    console.log(body);
    mc.query("SELECT * FROM usuarios WHERE correo = ?",body.correo,function(error,results,fields){
        if(error){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al busca usuario',
                errors:error
            });
        }
        if(!results.length){
            return res.status(400).json({
                ok:false,
                mensaje:'Credenciales incorrectas',
                errors:error
            });
        }
        console.log(results);
        if(!bcrypt.compareSync(body.clave,results[0].clave)){
            return res.status(400).json({
                ok:false,mensaje:'Credenciales Incorrectas',errors:error
            });
        }
        //Crear TOKEN
        let seed='Lizana'
        let token=jwt.sign({usuario:results[0].clave},seed,{expiresIn:14400});
        res.status(200).json({
            ok:true,
            usuario:results,
            id:results[0].rut,
            token:token
        });
    });
});

//Obtener Canchas Habilitadas
app.get('/canchasDisp', function (req, res){
    mc.query('select * from cancha where estado="DISPONIBLE"', function (err, results, fields) {
        if (err) throw error;
        return res.send({ 
            error:false,
            data: results,
            massage: 'Lista de login.'
        });
    });
});

//Obtener Canchas Habilitadas
app.get('/canchas', function (req, res){
    mc.query('select * from cancha', function (err, results, fields) {
        if (err) throw error;
        return res.send({ 
            error:false,
            data: results,
            massage: 'Lista de login.'
        });
    });
});

//Obtener Cancha No Disponibles
app.get('/canchasNoDisp', function (req, res){
    mc.query('select * from cancha where estado="NO DISPONIBLE"', function (err, results, fields) {
        if (err) throw error;
        return res.send({ 
            error:false,
            data: results,
            massage: 'Lista de login.'
        });
    });
});

//Obtener reservas
app.get('/reservas', function (req, res){
    mc.query('select * from reserva', function (err, results, fields) {
        if (err) throw error;
        return res.send({
            error:false,
            data: results,
            massage: 'Lista de login.'
        });
    });
});

//Obtener reservas
app.post('/partidas', function (req, res){
    let fecha=req.body.fecha;
    let categoria=req.body.categoria;
    let nivel=req.body.nivel;
    mc.query('SELECT * FROM reserva WHERE tipo=2 and fecha=? and categoria=? and nivel=?',[fecha,categoria,nivel],function (err, results, fields) {
        if (err) throw error;
        return res.send({
            error:false,
            data: results,
            massage: 'Lista de partidas.'
        });
    });
});

app.use('/',(req,res,next)=>{
    const bearerHeader = req.headers["authorization"];
    let token;
    let seed='Lizana';
    if (typeof bearerHeader !== "undefined") {
      token = bearerHeader.split(" ")[1];
    }
    jwt.verify(token,seed,(err,decoded)=>{
        if(err){
            return res.status(401).json({
                ok:false,
                mensaje:'Token Incorrecto',
                errors:err
            });
        }
        req.usuario=decoded.usuario;
        next();
    })
});

//Ingresar Reserva
app.post('/reserva', function (req, res) {
    let datosReserva = {
        idCancha: req.body.idCancha,
        nivel: req.body.nivel,
        categoria:req.body.categoria,
        jugador1: req.body.jugador1,
        fecha: req.body.fecha,
        horaInicio: req.body.horaInicio,
        tipo:req.body.tipo
    };
    if (mc) {
        mc.query("INSERT INTO reserva SET ?", datosReserva, function (error, result) {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error a crear reserva',
                    error: error
                })
            } else {
                
                mc.query('select nombre, correo from usuarios where rut=?', datosReserva.jugador1, function(sub_error, sub_result){
                    if (sub_error) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error con la cuenta',
                            error: error
                        })
                    } else {
                        let t = "";
                        let xd = "";
                        if(datosReserva.tipo == 1){
                            t="Reserva";
                            xd="Realizada";
                        }else{
                            t="Partida"
                            xd="Creada";
                        }
                        let msg= `<h3><span>`+t+` `+xd+`!</span></h3>
                                    <p>Hola `+sub_result[0].nombre+`!</p>
                                    <p>Tú `+t+` se ha ingresado correctamente</p>
                                    <p>Cancha: Cancha `+ datosReserva.idCancha +`</p>
                                    <p>Fecha: `+ datosReserva.fecha +`</p>
                                    <p>Hora: `+ datosReserva.horaInicio +`</p>`;

                        const mailOptions= {
                            from: "PADEL GO <padel.go.cli@gmail.com>",
                            to: sub_result[0].correo,
                            subject: t+" Ingresada",
                            generateTextFromHTML: true,
                            html: msg
                        }

                        smtpTransport.sendMail(mailOptions, (error, response) => {
                            error ? console.log(error) : console.log(response);
                            smtpTransport.close();
                        })
                    }
                });

                res.status(201).json({
                    ok: true,
                    usuario: result
                })
            }
        });
    }
});

//Ingresar Jugador a partida
app.put('/ingresarJugador/:id',function(req,res){
    let id=req.params.id;
    let jugador=req.body;
    console.log(id);
    console.log(jugador);
    if(!id || !jugador){
        return res.status(400).send({error:id, message:'El error esta en el id del formulario'});
    }
    mc.query('UPDATE reserva SET ? WHERE id = ?',[jugador,id],function(error,results,fields){
        if(error) throw error;
        return res.status(200).json({"Mensaje":"Formulario con id= "+id + "se modifico"});
    })
});

//Actualizar Estado de Cancha
app.put('/cancha',function(req,res){
    let id=req.body.id;
    let estado=req.body.estado;
    console.log(id);
    console.log(estado);
    if(!id || !estado){
        return res.status(400).send({error:id, message:'El error esta en el id de la Cancha'});
    }
    mc.query("UPDATE cancha SET estado=? WHERE id = ?",[estado,id],function(error,results,fields){
        if(error) throw error;
        return res.status(200).json({"Mensaje":"Cancha con id= "+id + "Se cambio al estado "+ estado});
    })
});

//Eliminar Usuario
app.delete('/usuario/:rut', function(req, res){
    let rut=req.params.rut;
    if(mc){
        console.log(rut);
        mc.query("DELETE FROM usuarios WHERE rut = ?",rut, function(error,result){
            if(error){
                return res.status(500).json({"Mensaje":"Error"});
            }
            else{
                return res.status(200).json({"Mensaje":"Usuario con rut " + rut + "Borrado"});
            }
        });
    }
});

//Obtener usuarios
app.get('/usuario/:id', function (req, res){
    let rut=req.params.id;
    mc.query('select * from usuarios where rut=?', rut ,function (err, results, fields) {
        if (err) throw error;
        return res.send({
            error:false,
            data: results,
            massage: 'Lista de usuarios.'
        });
    });
});
//Reportes
app.get('/getCanchas', function (req, res){
    mc.query('select * from cancha', function (err, results, fields) {
        if (err) throw error;
        return res.send({
            error:false,
            data: results,
            massage: 'Lista de login.'
        });
    });
});
app.get('/getview', (req, res) => {
    return res.send({
        error:false,
        data: visitas,
        massage: 'Visitas'
    })
})

app.post('/getReportePorCancha', function (req, res){
    var body=req.body 
    console.log(body)
    mc.query('SELECT * FROM reserva where idCancha = ? and fecha BETWEEN ? and ?',[body.id,body.inicio,body.termino], function (err, results) {
        if (err) throw error;
        return res.send({
            error:false,
            data: results,
            massage: 'Lista de Reporte por Canchas'
        });
    });
});
app.post('/getReservas', function (req, res){
    var body=req.body 
    console.log(body)
    mc.query('SELECT * from reserva where fecha BETWEEN ? and ?', [body.inicio,body.termino],function (err, results) {
        if (err) throw error;
        return res.send({
            error:false,
            data: results,
            massage: 'Lista de Reservas'
        });
    });
});
app.get('/horariosMasIncurridos', function (req, res){
    mc.query('SELECT horaInicio fecha, COUNT(*) cantidad from reserva GROUP by horaInicio ASC LIMIT 10', function (err, results) {
        if (err) throw error;
        return res.send({ 
            error:false,
            data: results,
            massage: 'Lista de fechas'
        });
    });
});

app.get('/canchasUtilizadas', function (req, res){
    mc.query('SELECT idCancha cancha, COUNT(*) cantidad from reserva GROUP by idCancha ASC', function (err, results) {
        if (err) throw error;
        return res.send({ 
            error:false,
            data: results,
            massage: 'Lista cantidad'
        });
    });
});

app.get('/estados', function (req, res){
    mc.query('SELECT estado, COUNT(*) cantidad from reserva GROUP by estado ASC', function (err, results) {
        if (err) throw error;
        return res.send({ 
            error:false,
            data: results,
            massage: 'Lista estados'
        });
    });
});



//Eliminar Reserva
app.delete('/reserva/:id', function(req, res){
    let id=req.params.id;
    if(mc){
        console.log(id);
        mc.query("DELETE FROM reserva WHERE id = ?",id, function(error,result){
            if(error){
                return res.status(500).json({"Mensaje":"Error"});
            }
            else{
                return res.status(200).json({"Mensaje":"Reserva n " + id + "Borrada"});
            }
        });
    }
});

//Obtener Reservas de un usuario
app.get('/reserva/:rut', function (req, res){
    let rut=req.params.rut;
    mc.query('select * from reserva where tipo=1 and jugador1=?', rut ,function (err, results, fields) {
        if(err){
            return res.status(500).json({"Mensaje":"Error"});
        }
        return res.send({
            error:false,
            data: results,
            massage: 'Lista de reservas.'
        });
    });
});

app.listen(4000, ()=>{
    console.log('Express Server - puerto 4000 online')
});

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Peticion realizada correctamente'
    })
})


