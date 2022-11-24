const express      = require('express');
const exphbs       = require('express-handlebars');
const app          = express();
const path         = require('path');
const db           = require('./db/conexao');
const bodyParser   = require('body-parser');
const Job          = require('./models/Job');
const Sequelize    = require('sequelize');
const Op           = Sequelize.Op;
const cookieParser = require('cookie-parser')
const PORT         = 3000;

app.listen(PORT, function(){
    console.log(`app online on port http://localhost:${PORT}`);
});

app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine('main'));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

//conexão com o banco;
db.authenticate()
.then(() => {
    console.log('Conectou ao banco com sucesso!');
})  
.catch(err => {
    console.log('Ocorreu um erro ao conectar', err);
});

//rotas login
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/gerencial', (req, res) => {
    res.render('adm')
});


//rota home;
app.get('/', (req, res) => {
   
    let search = req.query.job;
    let query  = '%'+search+'%';

    if(!search){
        Job.findAll({order: [
        ['createdAt', 'DESC']
    ]}).then(jobs => {
            for (let i = 0; i < jobs.length; i++) {
                let data = jobs[i].data;

                let dataAtual = new Date;
                dataAtual = dataAtual.toISOString();
                dataAtual = dataAtual.toString();
                dataAtual = dataAtual.slice(0, 5);

                let diferencaMeses = new Date(dataAtual) - new Date(data)
                let diferencadias = diferencaMeses / (1000 * 60 * 60 * 24);

                if (diferencadias > 30) {
                    jobs[i].new_job = 0;
                }
            }
        res.render('main_gerencial', {
            jobs
        });
    })
    } else {
        Job.findAll({
            where: {titulo: {[Op.like]: query}},
            order: [
            ['createdAt', 'DESC']
        ]})
            .then(jobs => {
                for (let i = 0; i < jobs.length; i++) {
                    let data = jobs[i].data;
    
                    let dataAtual = new Date;
                    dataAtual = dataAtual.toISOString();
                    dataAtual = dataAtual.toString();
                    dataAtual = dataAtual.slice(0, 10);
    
                    let diferencaMeses = new Date(dataAtual) - new Date(data)
                    let diferencadias = diferencaMeses / (1000 * 60 * 60 * 24);
    
                    if (diferencadias > 30) {
                        jobs[i].new_job = 0;
                    }
                }
            res.render('main_gerencial', {
                jobs, search
            });
        })
    }

});


app.use('/jobs', require('./Routes/jobs'));


 