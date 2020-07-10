const {stringStatus, stringSex, courseStringStatus} = require('../utils/parseString')

const format = (data) => {
    console.log(data)
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      document_description: data.document_description || null,
      begin_date: data.begin_date,
      end_date: data.end_date,
      duration: data.duration,
      is_important: data.is_important,
      is_in_offer: data.is_in_offer,
      offer_price: data.offer_price,
      with_date: data.with_date,
      category: {
        id: data.category_id,
        name: data.category_name,
        status: data.category_status,
        statusAsString: stringStatus(data.category_status)
      },
      image: data.image,
      link_media: data.link_media,
      modality: {
        id: data.modality_id,
        name: data.modality_name,
        status: data.modality_status,
        statusAsString: stringStatus(data.modality_status)
      },
      user: {
        id: data.user_id,
        email: data.user_email,
        name: data.user_name
      },
      provider: {
        id: data.provider_id,
        email: data.provider_email,
        name: data.provider_name,
        phone: data.provider_phone,
        sex: stringSex(data.provider_sex),
        image: data.provider_image,
        facebook: data.provider_facebook,
        twitter: data.provider_twitter,
        instagram: data.provider_instagram,
        description: data.provider_description
      },
      status: data.status,
      statusAsString: courseStringStatus(data.status),
      category_id: data.category_id,
      modality_id: data.modality_id,
      provider_id: data.provider_id
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
