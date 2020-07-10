const {stringSex, stringStatus} = require('../utils/parseString')

const format = (data) => {
    console.log(data)
    return {
        id: data.id,
        email: data.email,
        user_profile:{
            name: data.name || 'No posee',
            adress: data.adress || '',
            lastname: data.last_name,
            picture_url: data.picture_url,
            twitter: data.twitter,
            instagram: data.instagram,
            facebook: data.facebook,
            linkedin: data.linkedin,
            phone: data.phone,
            sex: data.sex,
            adress: data.adress,
            description: data.description,
            sexAsString: stringSex(data.sex),
            role: {
                id: data.role_id,
                name: data.role_name,
                description: data.role_description,
                status: data.role_status,
                statusAsString: stringStatus(data.role_status)
            },
            status: data.user_profile_status,
            statusAsString: stringStatus(data.user_profile_status)
        },
        status: data.user_status,
        statusAsString: stringStatus(data.user_status)
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