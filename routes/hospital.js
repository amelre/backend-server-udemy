//  Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Hospital = require('../models/hospital');


// ================================================
// 	Objeter todos los hospitales
// ================================================

app.get('/', (req, res, next)=>{

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
    .exec(
        (err, hospitales)=>{
            
            if(err){
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo)=>{

                res.status(200).json({
                    ok: true,
                    mensaje: 'Hospitales',
                    hospitales,
                    total: conteo
                });

            });
           
    
        }
    );
});

// ================================================
// 	Agregar un nuevo hospital
// ================================================

app.post('/', mdAutenticacion.verificaToken, (req, res)=>{
    var body = req.body;

    var hospital = new Hospital({
        nombre : body.nombre,
        img : body.img,
        usuario : req.usuario._id
    });

    hospital.save( (err, hospitalGuardado)=>{

        if(err){
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error guardando el hospital ',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

// ================================================
// 	Editar un hospital
// ================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res)=>{

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospitalDB)=>{

        if(err){
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar  el hospital',
                errors: err
            });
        }

        if( !hospitalDB){
            return  res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id '+ id + 'No existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }

        hospitalDB.nombre = body.nombre;
        hospitalDB.usuario = req.usuario._id;

        hospitalDB.save( (err, hospitalGuardado)=>{

            if(err){
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar  el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});

// ================================================
// 	Eliminar un hospital
// ================================================

app.delete('/:id',  mdAutenticacion.verificaToken ,(req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{

        if(err){
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar  el hospital',
                errors: err
            });
        }

        if(!hospitalBorrado){
            return  res.status(400).json({
                ok: false,
                mensaje: 'No existe ese hospital con el id',
                errors: null
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});


module.exports = app;