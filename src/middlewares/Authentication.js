const jwt = require('jsonwebtoken');

// =====================
// Verify Token
// =====================
let verifyToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.json({
                status: 500,
                message: 'Token no válido'
            });
        }
        console.log(decoded)
        req.usuario = decoded.usuario;
        next();

    });



};

// =====================
// Verify AdminRole
// =====================
let verifyAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    console.log(usuario)

    if (usuario.role_id === 1) {
        next();
    } else {

        return res.json({
            status: 500,
            message: 'El usuario no es administrador, no está autorizado para realizar la acción.'
        });
    }
};



module.exports = {
    verifyToken,
    verifyAdminRole
}