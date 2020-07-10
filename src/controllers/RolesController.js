"use strict";
const dbConnection = require("../../config/mysql");
const RoleTransformer = require("../transformers/RoleTransformer");


class RolesController {

	constructor(){
		this.connection = dbConnection();
    	this.roleTransformer = RoleTransformer;
		this.index = this.index.bind(this);
		this.show = this.show.bind(this);
		this.roleExistsById = this.roleExistsById.bind(this);
		this.roleExistsByName = this.roleExistsByName.bind(this);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.desactivate = this.desactivate.bind(this);
		this.reactivate = this.reactivate.bind(this);
		this.prepareToDelete = this.prepareToDelete.bind(this);
    	this.prepareToReactivate = this.prepareToReactivate.bind(this);
	}

	async index(req, res){

		var SELECT = 'SELECT * FROM role';
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Roles cargados con éxito.',
				roles: this.roleTransformer.transform(result)
			})

		})

	}

	async roleExistsById(req, res, next){
		const id = req.params.id

		var SELECT = 'SELECT * FROM role where id = ' + id;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			if(result.length === 0){
				return res.json({
					status: 500,
					message: 'El rol no existe.'
				})
			}

			next();

		})
	}

	async roleExistsByName(req, res, next){
		const name = req.body.name

		if(!name)
			return res.json({
				status: 500, 
				message: 'El nombre es necesario'
			})

		var SELECT = `SELECT * FROM role where name = '${name}'` ;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			if(result.length !== 0){
				return res.json({
					status: 500,
					message: 'Ya existe un rol con ese nombre.'
				})
			}

			next();

		})
	}

	async show(req, res){
		const id = req.params.id

		var SELECT = 'SELECT * FROM role where id = ' + id;
		this.connection.query(SELECT, (err, result) => {

			if(err)
				return res.status(500).json({
					status: 500,
					err
				})

			return res.json({
				status: 200,
				message: 'Rol cargado con éxito.',
				roles: this.roleTransformer.transform(result)
			})

		})

	}

	async create(req, res){

		this.connection.query(`INSERT INTO role(name, description) VALUES('${req.body.name || ''}','${req.body.description || ''}')`, (err, result) => {

			if(err)
				return res.status(500).json({
					status:500,
					err
				})

			this.connection.query('SELECT * FROM role where id = ? ', result.insertId, (err, resultGet) => {
				
				if(err)
					return res.status(500).json({
						status:500,
						err
					})				

				return res.json({
					status: 200,
					message: 'El rol ha sido creado con éxito',
					role: this.roleTransformer.transform(resultGet[0])
				})
			})
		})

	}

	async update(req, res) {

		this.connection.query(`UPDATE role SET ? where id = ${req.params.id}`, req.body, (err, result) => {
			if(err)
				return res.status(500).json({
					status:500,
					err
				})		

			this.connection.query(`SELECT * FROM role where id = ${req.params.id}`, (err, resultGet) => {
				
				if(err)
					return res.status(500).json({
						status:500,
						err
					})				

				return res.json({
					status: 200,
					message: 'Datos del rol modificados con éxito',
					role: this.roleTransformer.transform(resultGet[0])
				})
			})
		})
	}

	async desactivate(req, res, next) {
    const id = req.params.id

    this.connection.query(`UPDATE role SET status=\'2\' WHERE id = ${ id } `, (err, result) => {

      if(err){
        res.status(500).json({
          status: 500,
          err
        })
      }

      return res.status(200).json({
        status: 200,
        message: 'Se ha desactivado el rol con éxito'
      })

    })

  }

  async reactivate(req, res, next) {
    const id = req.params.id

    this.connection.query(`UPDATE role SET status=\'1\' WHERE id = ${ id } `, (err, result) => {

      if(err){
        res.status(500).json({
          status: 500,
          err
        })
      }

      return res.status(200).json({
        status: 200,
        message: 'Se ha activado el rol con éxito'
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

    this.connection.query(`SELECT * FROM role WHERE id = '${ id }'`, (err, result) => {
      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }

      if(result.length === 0){
        return res.status(200).json({
          status: 500,
          message: 'El rol no existe'
        })
      }

      if(parseInt(result[0].status, 10) === 2){
        return res.status(200).json({
          status: 500,
          message: 'El rol ya se encuentra inactivo'
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

    this.connection.query(`SELECT * FROM role WHERE id = '${ id }'`, (err, result) => {
      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }

      if(result.length === 0){
        return res.status(200).json({
          status: 500,
          message: 'El rol no existe'
        })
      }

      if(parseInt(result[0].status, 10) === 1){
        return res.status(200).json({
          status: 500,
          message: 'El rol ya se encuentra activo'
        }) 
      }

      next()

    })

  }

}

module.exports = new RolesController();