const {stringStatus} = require('../utils/parseString')

const format = (data) => {
    console.log(data)
    return {
        id: data.id,
        name: data.name,
        description: data.description,    
        status: data.status,
        statusAsString: stringStatus(data.status)
    };
};

exports.transform = (data) => {
    if(Array.isArray(data)){
        return data.map(item => {
            return format(item);
        })
    }

    return format(data);
};