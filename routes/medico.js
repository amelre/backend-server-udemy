//  Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Medico = require('../models/medico');


// ================================================
// 	Objeter todos los medicos
// ================================================

app.get('/', (req, res)=>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
    .populate('hospital')
    .exec(
        (err, medicos)=>{
            
            if(err){
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo)=>{
                res.status(200).json({
                    ok: true,
                    mensaje: 'Medicos',
                    medicos,
                    total: conteo
                });
            });
            
        }
    );
});

// ================================================
// 	Agregar un nuevo medico
// ================================================

app.post('/', mdAutenticacion.verificaToken, (req, res)=>{
    var body = req.body;

    var medico = new Medico({
        nombre : body.nombre,
        usuario : req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado)=>{

        if(err){
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error guardando el medico ',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// ================================================
// 	Editar un medico
// ================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res)=>{

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, (err, medicoDB)=>{

        if(err){
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar  el medico',
                errors: err
            });
        }

        if( !medicoDB){
            return  res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id '+ id + 'No existe',
                errors: {message: 'No existe un medico con ese ID'}
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.usuario = req.usuario._id;
        medicoDB.hospital = body.hospital;

        medicoDB.save( (err, medicoGuardado)=>{

            if(err){
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar  el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// ================================================
// 	Eliminar un medico
// ================================================

app.delete('/:id',  mdAutenticacion.verificaToken ,(req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado)=>{

        if(err){
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar  el medico',
                errors: err
            });
        }

        if(!medicoBorrado){
            return  res.status(400).json({
                ok: false,
                mensaje: 'No existe ese medico con el id',
                errors: null
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});


module.exports = app;