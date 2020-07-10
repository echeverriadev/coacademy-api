const fs = require('fs');
const path = require('path');


class FileServiceController {

  constructor(){

    this.sendImage = this.sendImage.bind(this);
    this.sendPDF = this.sendPDF.bind(this);

  }

  async sendImage(req, res, next) {

    let tipo = req.params.tipo
    let image = req.params.image
      
    let pathImage = ""

    if(tipo === "courses")
      pathImage = path.resolve(__dirname,`../../public/uploads/courses/images/${image}`);

    if(tipo === "users")
      pathImage = path.resolve(__dirname,`../../public/uploads/users/${image}`);

    if(fs.existsSync(pathImage)) {
      res.sendFile(pathImage);
    }else{
      let noImageFounPath = path.resolve(__dirname, '../../public/assets/not_found.png')
      res.sendFile(noImageFounPath)
    }
  
  }

  async sendPDF(req, res, next) {

    let tipo = req.params.tipo
    let name = req.params.name
      

    let pathPdf = path.resolve(__dirname,`../../public/uploads/courses/pdfs/${name}`);


    if(fs.existsSync(pathPdf)) {
      res.contentType("application/pdf");
      res.send(pathPdf);
    }else{
      let noImageFounPath = path.resolve(__dirname, '../../public/assets/file-not-found.jpg')
      res.sendFile(noImageFounPath)
    }
  
  }


  async downloadFile(req, res){

    let pathPdf = path.resolve(__dirname,`../../public/uploads/courses/pdfs/${req.params.name}`);

    if(!fs.existsSync(pathPdf)) {
      let noImageFounPath = path.resolve(__dirname, '../../public/assets/file-not-found.jpg')
      return res.sendFile(noImageFounPath)
    }

    res.download(pathPdf,function(err){
      if(err) console.log(err)
      else console.log("listo")
    });
  }

}

module.exports = new FileServiceController();