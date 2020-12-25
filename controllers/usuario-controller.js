const mysql = require('mysql');
const config = require('../config');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
 
exports.GetAllUsuarios = (req,res) => {
    console.log(req.usuario);
    const connection = mysql.createConnection(config)
    strSql : String;
    strSql = "SELECT	US.*, GU.GU_GUDESCRICAO, CL.CL_CLNOME, CL.CL_CLSIGLA, CL.CL_CLEMBLEMA "
    strSql = strSql + " FROM	USUARIO US "
    strSql = strSql + " JOIN	GRUPOUSUARIO GU ON US.US_GUID = GU.GU_GUID "
    strSql = strSql + " JOIN	CLUBES CL ON US.US_CLID = CL.CL_CLID; "
    connection.query(strSql,( err, rows, fields) =>{
        connection.destroy();
        if (err) {return res.status(500).send({ error: err}) }
        if (rows.length < 1){ return res.status(401).send({ mensagem: 'Nenhum usuario encontrado'})}
        const response = {
            usuarios: rows.map(us => {
                return {
                    US_USID: us.US_USID,
                    US_USLOGIN: us.US_USLOGIN,
                    US_USSENHA: us.US_USSENHA,
                    US_USATIVO: us.US_USATIVO,
                    US_USNOMETRATAMENTO: us.US_USNOMETRATAMENTO,
                    US_CLID : us.US_CLID,
                    OBJ_CLUBE : {
                        CL_CLID : us.US_CLID,
                        CL_CLNOME  : us.CL_CLNOME,
                        CL_CLSIGLA  : us.CL_CLSIGLA,
                        CL_CLEMBLEMA : us.CL_CLEMBLEMA,
                    },
                    US_GUID : us.US_GUID,
                    OBJ_GRUPOUSUARIO : {
                        GU_GUID: us.US_GUID,
                        GU_GUDESCRICAO: us.GU_GUDESCRICAO,
                    },
                    US_USEMAIL : us.US_USEMAIL,
                    US_USDATACADASTRO : us.US_USDATACADASTRO
                }
            })
        }
        return res.status(200).send(response.usuarios);
    }
)}

exports.GetIdusuario = (req,res) => {
    strSql : String;
    const connection = mysql.createConnection(config)
    strSql = "SELECT * FROM USUARIO WHERE US_USID = ? "
    
    connection.query(strSql,[req.params.id],( err, rows, fields) =>{
        connection.destroy();
        if (err) {return res.status(500).send({ error: err}) }
        if (rows.length < 1){ return res.status(401).send({ mensagem: 'Nenhum usuario encontrado'})}
        const response = {
            US_USID: rows[0].US_USID,
            US_USLOGIN: rows[0].US_USLOGIN,
            US_USSENHA: rows[0].US_USSENHA,
            US_USATIVO: rows[0].US_USATIVO,
            US_USNOMETRATAMENTO: rows[0].US_USNOMETRATAMENTO,
            US_CLID : rows[0].US_CLID,
            US_GUID : rows[0].US_GUID,
            US_USEMAIL : rows[0].US_USEMAIL,
            US_USDATACADASTRO : rows[0].US_USDATACADASTRO
        }
        return res.status(200).send(response);
    })
}

exports.VerificaLogin = (req,res) => {
    strSql : String;
    const connection = mysql.createConnection(config)
    strSql = "SELECT US_USLOGIN, US_USEMAIL FROM USUARIO "
    connection.query(strSql,( err, rows, fields) =>{
        connection.destroy();
        if (err) {return res.status(500).send({ error: err}) }
        if (rows.length < 1){ 
            const responseNull = {
                usuarios  : { login: 'nao encontrado', email: 'nao encontrado' }
            }
            return res.status(200).send(responseNull);}
        const response = {
            usuarios: rows.map( us => { 
                return { login: us.US_USLOGIN,
                         email: us.US_USEMAIL}
            })
        }
        return res.status(200).send(response);
    })
}

exports.Incluirusuario = (req, res) => {
    strSql : String;
    blnAtivo : Boolean;
    console.log("chegou")
    if (req.body.US_USATIVO == ''){blnAtivo = false} else{blnAtivo = true}
    bcrypt.hash(req.body.US_USSENHA, 10, (errBcrypt, hash) => {
    if (errBcrypt) {return res.status(500).send({ error: errBcrypt})}
    strSql = "INSERT INTO USUARIO (US_USLOGIN,US_USATIVO,US_CLID,US_GUID,US_USEMAIL,US_USNOMETRATAMENTO,US_USDATACADASTRO,US_USSENHA) "
    strSql = strSql + " VALUES (?,?,?,?,?,?,?,?)" ;
    console.log(hash);
    const connection = mysql.createConnection(config)
    connection.query(strSql,[req.body.US_USLOGIN,blnAtivo,req.body.US_CLID,req.body.US_GUID
        ,req.body.US_USEMAIL,req.body.US_USNOMETRATAMENTO,req.body.US_USDATACADASTRO
        , hash ],( err, results, fields) =>{
        connection.destroy();
        if (err) {return false}
        console.log("Usuário inserido com sucesso");
        res.end()
        return true;
        })
    });
}

exports.Login = (req,res) => {
    const connection = mysql.createConnection(config);
    strSql : String;
    strSql = "SELECT * FROM USUARIO WHERE US_USLOGIN = ? "
    connection.query(strSql,[req.body.US_USLOGIN],( err, rows, fields) =>{
        connection.destroy();
        if (err) {return res.status(500).send({ error: err})}
        if (rows.length < 1){ return res.status(401).send({ mensagem: 'Falha na autenticação 1'})}
        bcrypt.compare(req.body.US_USSENHA, rows[0].US_USSENHA,(err, result) =>{
            if (err) { return res.status(401).send({ mensagem: 'Falha na autenticação 2'})}
            if (result) { 
                const token = jwt.sign({
                    US_USLOGIN: rows[0].US_USLOGIN,
                    US_USEMAIL: rows[0].US_USEMAIL
                },
                "segredo",
                {
                    expiresIn: "1h"
                });
                
                return res.status(200).send({
                     mensagem: 'Autenticado com sucesso',
                    token: token,
                    usuario: { US_USID : rows[0].US_USID,
                               US_USLOGIN :rows[0].US_USLOGIN,
                               US_USNOMETRATAMENTO :rows[0].US_USNOMETRATAMENTO,
                               US_USEMAIL: rows[0].US_USEMAIL,
                               US_GUID : rows[0].US_GUID,
                    }
                })
            }
            
            return res.status(401).send({ mensagem: 'Falha na autenticação 3'})
        });
    });

}

exports.ExcluirUsuario = (req, res) => {
    strSql : String;
    blnAtivo : Boolean;
    strSql = "DELETE FROM USUARIO WHERE US_USID = ? ";
    console.log(strSql);
    const connection = mysql.createConnection(config)
    connection.query(strSql,[req.params.id],( err, results, fields) =>{
        connection.destroy();
        if (err) {return false}
        console.log("Usuário excluído com sucesso");
        res.end()
        return true;
    })
}

exports.AlterarUsuario = (req, res) => {
    strSql : String;
    blnAtivo : Boolean;
    if (req.body.US_USATIVO == ''){blnAtivo = false}else{blnAtivo = true}
    if (req.body.US_USSENHA == null){
        strSql = "UPDATE USUARIO SET US_USLOGIN = ? ,US_CLID = ? , US_GUID = ? ,US_USEMAIL = ? ";
            strSql = strSql + ",US_USNOMETRATAMENTO = ? , US_USATIVO = ? " ;
            strSql = strSql + " WHERE US_USID = ? ";
            console.log(strSql);
            const connection = mysql.createConnection(config)
            connection.query(strSql,[req.body.US_USLOGIN,req.body.US_CLID,req.body.US_GUID,req.body.US_USEMAIL
                                    ,req.body.US_USNOMETRATAMENTO,blnAtivo,req.body.US_USID],( err, results, fields) =>{
                connection.destroy();
                if (err){return false}
                console.log("Usuario alterado com sucesso com o id:", results.insertedId)
                res.end()
                return true;
            })
    }else{
        bcrypt.hash(req.body.US_USSENHA, 10, (errBcrypt, hash) => {
            if (errBcrypt) {return res.status(500).send({ error: errBcrypt})}
            strSql = "UPDATE USUARIO SET US_USLOGIN = ? ,US_CLID = ? , US_GUID = ? ,US_USEMAIL = ? ";
            strSql = strSql + ",US_USNOMETRATAMENTO = ? , US_USATIVO = ? , US_USSENHA = ? " ;
            strSql = strSql + " WHERE US_USID = ? ";
            console.log(strSql);
            const connection = mysql.createConnection(config)
            connection.query(strSql,[req.body.US_USLOGIN,req.body.US_CLID,req.body.US_GUID,req.body.US_USEMAIL
                                    ,req.body.US_USNOMETRATAMENTO,blnAtivo,hash, req.body.US_USID],( err, results, fields) =>{
                connection.destroy();
                if (err){return false}
                console.log("Usuario alterado com sucesso com o id:", results.insertedId)
                res.end()
                return true;
            })
        })
    }
}

exports.EnviarEmail = (req, res) => {
    const connection = mysql.createConnection(config);
    strSql : String;
    strSql = "SELECT * FROM USUARIO WHERE US_USEMAIL = ? "
    connection.query(strSql,[req.body.email],( err, rows, fields) =>{
        if (err) {return res.status(500).send({ error: err})}
        if (rows.length < 1){ return res.status(401).send({ mensagem: 'Falha na autenticação 1'})}
        strSql = "INSERT INTO SOLICITASENHA (SS_USID,SS_USEMAIL,SS_SSGUIDE,	SS_SSDATACADASTRO) "
        strSql = strSql + " VALUES ( ?,?,uuid(),now())"
        connection.query(strSql,[rows[0].US_USID,rows[0].US_USEMAIL],( err, results, fields) =>{
            if (err) {return false}
            console.log("Solicitação de senha inserida com sucesso");
            strSql = "SELECT * FROM SOLICITASENHA WHERE SS_USEMAIL = ? ORDER BY SS_SSDATACADASTRO DESC "
            connection.query(strSql,[req.body.email],( err, results, fields) =>{
                connection.destroy();
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: false,
                    port: 25,
                    auth: {
                        user: 'henriqueeizu@gmail.com',
                        pass: '850495ab'
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                var mailOptions = {
                    from: 'henriqueeizu@gmail.com',
                    to: 'h_eizu@hotmail.com',
                    subject: 'Troca de Senha site ChuteFutmesa',
                    text: 'Acessar o link http://localhost:4200/TrocaSenha/' + results[0].SS_SSGUIDE
                };

                // transporter.sendMail(mailOptions, function(error, info){
                //     if (error) {
                //         console.log(error);
                //     } else {
                //         console.log('Email sent: ' + info.response);
                //     }

                // })
            
                res.end()
                return true;

            })

        })
    });

}

exports.TrocarSenha = (req, res) => {
    const connection = mysql.createConnection(config);
    strSql : String;
    strSql = "SELECT * FROM SOLICITASENHA WHERE SS_SSGUIDE = ? "
    connection.query(strSql,[req.body.guide],( err, rows, fields) =>{
        if (err) {return res.status(500).send({ error: err})}
        if (rows.length < 1){ return res.status(401).send({ mensagem: 'Guide não encontrado'})}
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
            if (errBcrypt) {return res.status(500).send({ error: errBcrypt})}
            strSql = "UPDATE USUARIO SET US_USSENHA = ? " ;
            strSql = strSql + " WHERE US_USID = ? ";
            console.log(strSql + hash + "lll   " + rows[0].US_USID );
            const connection = mysql.createConnection(config)
            connection.query(strSql,[hash, rows[0].SS_USID],( err, results, fields) =>{
                connection.destroy();
                if (err){return false}
                console.log("Senha alterada com sucesso com o id:", results.insertedId)
                res.end()
                return true;
            })
        })
    });
}

