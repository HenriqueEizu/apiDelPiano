const express = require('express');
const router = express.Router();
const mysql = require('mysql');
let config = require('../config.js');
var cors = require('cors')
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Login = require('../middleware/login');
const usuariosControllers = require('../controllers/usuario-controller');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.options('/listausuarios', cors()) // enable pre-flight request for DELETE 
router.get('/listausuarios', Login.obrigatorio, cors(), usuariosControllers.GetAllUsuarios)

router.options('/verificaLogin', cors()) // enable pre-flight request for DELETE 
router.get('/verificaLogin', cors(), usuariosControllers.VerificaLogin)

router.options('/GetIdusuario/:id', cors()) // enable pre-flight request for DELETE 
router.get('/GetIdusuario/:id',Login.obrigatorio, cors(), usuariosControllers.GetIdusuario)

router.options('/Incluir',  cors()) // enable pre-flight request for DELETE 
router.post('/Incluir', cors(), usuariosControllers.Incluirusuario)

router.options('/login', cors()) // enable pre-flight request for DELETE 
router.post('/login',cors(),usuariosControllers.Login)

router.options('/Excluir/:id', bodyParser.json(),cors())
router.delete('/Excluir/:id', Login.obrigatorio, cors(),usuariosControllers.ExcluirUsuario);

router.options('/Alterar/:id', bodyParser.json(),cors())
router.put('/Alterar/:id', Login.obrigatorio, cors(), usuariosControllers.AlterarUsuario);

router.options('/EnviarEmail', bodyParser.json(),cors())
router.post('/EnviarEmail', cors(), usuariosControllers.EnviarEmail);

router.options('/TrocarSenha', bodyParser.json(),cors())
router.post('/TrocarSenha', cors(), usuariosControllers.TrocarSenha);

module.exports = router;