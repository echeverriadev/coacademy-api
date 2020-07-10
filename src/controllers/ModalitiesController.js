"use strict";
const dbConnection = require("../../config/mysql");
const ModalityTransformer = require("../transformers/ModalityTransformer");


class ModalitiesController {

	constructor(){
		this.connection = dbConnection();
    this.modalityTransformer = ModalityTransformer;
		this.index = this.index.bind(this);
		this.show = this.show.bind(this);
		this.modalityExistsById = this.modalityExistsById.bind(this);
		this.modalityExistsByName = this.modalityExistsByName.bind(this);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.desactivate = this.desactivate.bind(this);
		this.reactivate = this.reactivate.bind(this);
		this.prepareToDelete = this.prepareToDelete.bind(this);
    this.prepareToReactivate = this.prepareToReactivate.bind(this);
    this.indexActives = this.indexActives.bind(this);
	}

	async index(req, res){

		var SELECT = 'SELECT * FROM modality';
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Modalidades cargados con éxito.',
				modalities: this.modalityTransformer.transform(result)
			})

		})

	}

	async indexActives(req, res){

		var SELECT = 'SELECT * FROM modality where status=1';
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Modalidades cargados con éxito.',
				modalities: this.modalityTransformer.transform(result)
			})

		})

	}

	async modalityExistsById(req, res, next){
		const id = req.params.id

		var SELECT = 'SELECT * FROM modality where id = ' + id;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			if(result.length === 0){
				return res.json({
					status: 500,
					message: 'la modalidad no existe.'
				})
			}

			next();

		})
	}

	async modalityExistsByName(req, res, next){
		const name = req.body.name

		if(!name)
			return res.json({
				status: 500, 
				message: 'El nombre es necesario'
			})

		var SELECT = `SELECT * FROM modality where name = '${name}'` ;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			if(result.length !== 0){
				return res.json({
					status: 500,
					message: 'Ya existe una modalidad con ese nombre.'
				})
			}

			next();

		})
	}

	async show(req, res){
		const id = req.params.id

		var SELECT = 'SELECT * FROM modality where id = ' + id;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Modalidad cargada con éxito.',
				modalities: this.modalityTransformer.transform(result)
			})

		})

	}

	async create(req, res){

		this.connection.query(`INSERT INTO modality(name, description) VALUES('${req.body.name || ''}','${req.body.description || ''}')`, (err, result) => {

			if(err)
				return res.status(500).json({
					status:500,
					err
				})

			this.connection.query('SELECT * FROM modality where id = ? ', result.insertId, (err, resultGet) => {
				
				if(err)
					return res.status(500).json({
						status:500,
						err
					})				

				return res.json({
					status: 200,
					message: 'la modalidad ha sido creado con éxito',
					modality: this.modalityTransformer.transform(resultGet[0])
				})
			})
		})

	}

	async update(req, res) {

		this.connection.query(`UPDATE modality SET ? where id = ${req.params.id}`, req.body, (err, result) => {
			if(err)
				return res.status(500).json({
					status:500,
					err
				})		

			this.connection.query(`SELECT * FROM modality where id = ${req.params.id}`, (err, resultGet) => {
				
				if(err)
					return res.status(500).json({
						status:500,
						err
					})				

				return res.json({
					status: 200,
					message: 'Datos de la modalidad modificados con éxito',
					modality: this.modalityTransformer.transform(resultGet[0])
				})
			})
		})
	}

	async desactivate(req, res, next) {
    const id = req.params.id

    this.connection.query(`UPDATE modality SET status=\'2\' WHERE id = ${ id } `, (err, result) => {

      if(err){
        res.status(500).json({
          status: 500,
          err
        })
      }

      return res.status(200).json({
        status: 200,
        message: 'Se ha desactivado la modalidad con éxito'
      })

    })

  }

  async reactivate(req, res, next) {
    const id = req.params.id

    this.connection.query(`UPDATE modality SET status=\'1\' WHERE id = ${ id } `, (err, result) => {

      if(err){
        res.status(500).json({
          status: 500,
          err
        })
      }

      return res.status(200).json({
        status: 200,
        message: 'Se ha activado la modalidad con éxito'
      })

    })
  }

  async prepareToDelete(req, res, next){ 
    const id = req.params.id

    if(!id){
      return res.json({
        status: 500,
        message: "ingrese un id"
      })
    }

    this.connection.query(`SELECT * FROM modality WHERE id = '${ id }'`, (err, result) => {
      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }

      if(result.length === 0){
        return res.status(200).json({
          status: 500,
          message: 'la modalidad no existe'
        })
      }

      if(parseInt(result[0].status, 10) === 2){
        return res.status(200).json({
          status: 500,
          message: 'la modalidad ya se encuentra inactivo'
        }) 
      }

      next()

    })

  }

  async prepareToReactivate(req, res, next){ 
    const id = req.params.id

    if(!id){
      return res.json({
        status: 500,
        message: "ingrese un id"
      })
    }

    this.connection.query(`SELECT * FROM modality WHERE id = '${ id }'`, (err, result) => {
      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }

      if(result.length === 0){
        return res.status(200).json({
          status: 500,
          message: 'la modalidad no existe'
        })
      }

      if(parseInt(result[0].status, 10) === 1){
        return res.status(200).json({
          status: 500,
          message: 'la modalidad ya se encuentra activo'
        }) 
      }

      next()

    })

  }

}

module.exports = new ModalitiesController();