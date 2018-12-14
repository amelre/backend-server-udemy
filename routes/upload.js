//  Requires
var express = require('express');

var fileUpload = require('express-fileupload');
var  fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next ) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos','usuarios'];
    if(tiposValidos.lastIndexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no valida',
            errors: {message: 'Los tipos de colección validos son '+ tiposValidos.join(', ')}
        }); 
    }

    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {message: 'debe seleccionar la imagen'}
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];

    //Solo estas extenciones aceptamos
    var extensionesValidas = ['png', 'jpg','gif','jpeg'];

    if( extensionesValidas.indexOf(extensionArchivo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: {message: 'Las extensiones validas son '+ extensionesValidas.join(', ')}
        }); 
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;


    //mover archivo del temporal a un especifico

    var path = `./uploads/${ tipo }/${nombreArchivo}`;

    archivo.mv(path, err=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo.',
                errors: err
            }); 
        }

        subitPorTipo(tipo, id, nombreArchivo, res);
        


    });
});


function subitPorTipo(tipo, id, nombreArchivo, res){

    if(tipo === 'usuarios'){
        Usuario.findById( id,  (err, usuario) =>{

            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                }); 
            }

            var pathViejo = './uploads/usuarios/'+ usuario.img;

            //si existe limina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado)=>{

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });
            
        });

    }

    if(tipo === 'medicos'){

        Medico.findById( id,  (err, medico) =>{

            if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'medico no existe',
                    errors: {message: 'medico no existe'}
                }); 
            }

            var pathViejo = './uploads/medicos/'+ medico.img;

            //si existe limina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado)=>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    usuario: medicoActualizado
                });

            });
            
        });
    }

    if(tipo === 'hospitales'){
        Hospital.findById( id,  (err, hospital) =>{

            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no existe',
                    errors: {message: 'hospital no existe'}
                }); 
            }

            var pathViejo = './uploads/hospitales/'+ hospital.img;

            //si existe limina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado)=>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    usuario: hospitalActualizado
                });

            });
            
        });
    }

}

module.exports = app;