function addDayWithoutFormat(date){

	if (!date) return "";
	
	let date_parse = new Date(date);

	date_parse.setDate(date_parse.getDate() + 1);

	return date_parse; 

}

function dateParse(date){
	if(!date)
		return ""

	let parseDate = new Date(date) 

	let day = parseDate.getDate()	
	if(day <= 10){
		day = '0' + day.toString();
	}
	let month = parseDate.getMonth() + 1

	if(month <= 9){
		month = '0' + month.toString()
	}

	let year = parseDate.getFullYear()	

	console.log(`${year}-${month}-${day}`)

	return `${year}-${month}-${day}`

}

module.exports = {
	addDayWithoutFormat,
	dateParse
}