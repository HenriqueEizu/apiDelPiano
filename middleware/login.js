const jwt = require('jsonwebtoken');

exports.obrigatorio = (req, res, next) => {
    // try {
        const token1 = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token1,"segredo");
        req.usuario = decode;
        next();
    // } catch{
    //     return res.status(401).send({ mensagem: 'Falha na autenticação token'})
    // }
}

exports.optional = (req, res, next) => {
    // try {
        const token1 = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token1,"segredo");
        req.usuario = decode;
        next();
    // } catch{
    //     next();
    // }
}