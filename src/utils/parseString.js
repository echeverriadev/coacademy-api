const stringSex = (sex) => {
	if(sex && sex !== undefined && sex !== null) {
		switch(sex){
			case '1': 
				return 'Masculino';
				break;
			default:
				return 'Femenino';
				break;
		}
	}	
}

const stringStatus = (status) => {

	if(status && status !== undefined && status !== null) {
		switch(status){
			case '1': 
				return 'Activo';
				break;
			default:
				return 'Inactivo';
				break;
		}
	}

}

const courseStringStatus = (status) => {

	if(status && status !== undefined && status !== null) {
		switch(status){
			case '1': 
				return 'Publicado';
				break;
			default:
				return 'Inactivo';
				break;
		}
	}	

}

module.exports = {
	stringSex,
	stringStatus,
	courseStringStatus
}