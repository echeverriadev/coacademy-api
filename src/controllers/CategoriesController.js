"use strict";
const dbConnection = require("../../config/mysql");
const CategoryTransformer = require("../transformers/CategoryTransformer");

class CategoriesController {

	constructor(){
		this.connection = dbConnection();
  	this.categoryTransformer = CategoryTransformer;
		this.index = this.index.bind(this);
		this.show = this.show.bind(this);
		this.categoryExistsById = this.categoryExistsById.bind(this);
		this.categoryExistsByName = this.categoryExistsByName.bind(this);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.desactivate = this.desactivate.bind(this);
		this.reactivate = this.reactivate.bind(this);
		this.prepareToDelete = this.prepareToDelete.bind(this);
  	this.prepareToReactivate = this.prepareToReactivate.bind(this);
  	this.indexActives = this.indexActives.bind(this);
	}

	async index(req, res){

		var SELECT = 'SELECT * FROM category';
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Categorias cargadas con éxito.',
				categories: this.categoryTransformer.transform(result)
			})

		})

	}

	async indexActives(req, res){

		var SELECT = 'SELECT * FROM category where status = 1';
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Categorias cargadas con éxito.',
				categories: this.categoryTransformer.transform(result)
			})

		})

	}

	async categoryExistsById(req, res, next){
		const id = req.params.id

		var SELECT = 'SELECT * FROM category where id = ' + id;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			if(result.length === 0){
				return res.json({
					status: 500,
					message: 'La categoria no existe.'
				})
			}

			next();

		})
	}

	async categoryExistsByName(req, res, next){
		const name = req.body.name

		if(!name)
			return res.json({
				status: 500, 
				message: 'El nombre es necesario'
			})

		var SELECT = `SELECT * FROM category where name = '${name}'` ;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			if(result.length !== 0){
				return res.json({
					status: 500,
					message: 'Ya existe una categoria con ese nombre.'
				})
			}

			next();

		})
	}

	async show(req, res){
		const id = req.params.id

		var SELECT = 'SELECT * FROM category where id = ' + id;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Categoria cargado con éxito.',
				categories: this.categoryTransformer.transform(result)
			})

		})

	}

	async create(req, res){

		this.connection.query(`INSERT INTO category(name, description) VALUES('${req.body.name || ''}','${req.body.description || ''}')`, (err, result) => {

			if(err)
				return res.status(500).json({
					status:500,
					err
				})

			this.connection.query('SELECT * FROM category where id = ? ', result.insertId, (err, resultGet) => {
				
				if(err)
					return res.status(500).json({
						status:500,
						err
					})				

				return res.json({
					status: 200,
					message: 'La categoria ha sido creado con éxito',
					category: this.categoryTransformer.transform(resultGet[0])
				})
			})
		})

	}

	async update(req, res) {

		this.connection.query(`UPDATE category SET ? where id = ${req.params.id}`, req.body, (err, result) => {
			if(err)
				return res.status(500).json({
					status:500,
					err
				})		

			this.connection.query(`SELECT * FROM category where id = ${req.params.id}`, (err, resultGet) => {
				
				if(err)
					return res.status(500).json({
						status:500,
						err
					})				

				return res.json({
					status: 200,
					message: 'Datos de la categoria modificados con éxito',
					category: this.categoryTransformer.transform(resultGet[0])
				})
			})
		})
	}

	async desactivate(req, res, next) {
    const id = req.params.id

    this.connection.query(`UPDATE category SET status=\'2\' WHERE id = ${ id } `, (err, result) => {

      if(err){
        res.status(500).json({
          status: 500,
          err
        })
      }

      return res.status(200).json({
        status: 200,
        message: 'Se ha desactivado la categoria con éxito'
      })

    })

  }

  async reactivate(req, res, next) {
    const id = req.params.id

    this.connection.query(`UPDATE category SET status=\'1\' WHERE id = ${ id } `, (err, result) => {

      if(err){
        res.status(500).json({
          status: 500,
          err
        })
      }

      return res.status(200).json({
        status: 200,
        message: 'Se ha activado la categoria con éxito'
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

    this.connection.query(`SELECT * FROM category WHERE id = '${ id }'`, (err, result) => {
      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }

      if(result.length === 0){
        return res.status(200).json({
          status: 500,
          message: 'La categoria no existe'
        })
      }

      if(parseInt(result[0].status, 10) === 2){
        return res.status(200).json({
          status: 500,
          message: 'La categoria ya se encuentra inactivo'
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

    this.connection.query(`SELECT * FROM category WHERE id = '${ id }'`, (err, result) => {
      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }

      if(result.length === 0){
        return res.status(200).json({
          status: 500,
          message: 'La categoria no existe'
        })
      }

      if(parseInt(result[0].status, 10) === 1){
        return res.status(200).json({
          status: 500,
          message: 'La categoria ya se encuentra activo'
        }) 
      }

      next()

    })

  }

}

module.exports = new CategoriesController();