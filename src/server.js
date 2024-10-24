
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const env = require('dotenv').config();

const app = express();
const port = 3006;

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
    user: 'default',
    host: 'ep-shiny-limit-a41h96xf-pooler.us-east-1.aws.neon.tech',
    database: 'verceldb',
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
      }
  });
app.use(bodyParser.json());

// Testar a conexão com o banco de dados
pool.connect()
  .then(client => {
    console.log('Conexão com o PostgreSQL bem-sucedida!');
    client.release();
  })
  .catch(err => {
    console.error('Erro ao conectar ao PostgreSQL:', err);
    process.exit(1); 
  });

app.post('/alarm', async(req, res)=> { 
  const { 
    empresa,
    source,
    timestamp,
    priority,
    cause,
    causeValue,
    effect,
    effectValue
   } = req.body;

  const { v4: uuidv4 } = require('uuid');
  const alarmId = uuidv4();

  try {
      
      const getId = await pool.query(`
        SELECT
            id
        FROM
            "empresas"
        WHERE
            integrador = false 
        AND
            "nomeFantasia" = $1
        AND
            ativo = true;
        `,[empresa])

      const result = await pool.query(
        `INSERT INTO "alarmes"(
            id,
            empresa,
            source,
            timestamp,
            priority,
            cause,
            "causeValue",
            effect,
            "effectValue"
          ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
            alarmId,
            getId.rows[0].id,
            source,
            timestamp,
            priority,
            cause,
            causeValue,
            effect,
            effectValue,
        ]
      );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
    res.status(500).json({ error: 'Erro ao inserir dados de alarme' });
  }
});

app.post('/insert', async (req, res) => {
  const { empresa, 
    dataImportacao,
    tensaoEletrica,
    correnteEletrica,
    frequencia,
    fatorPotencia,
    harmonicas,
    energiaAtiva,
    energiaReativa,
    energiaAparente,
    energiaInjetada,
    demandaAtiva,
    demandaReativa,
    demandaAparente,
    alarmes,
    naoConformidade,
   } = req.body;

   console.log(req.body)

  const [date, time] = dataImportacao.split(' ')
  const [day, month, year] = date.split('/').map(Number)
  const [hours, minutes, seconds] = time.split(':').map(Number)

  const isoDate = new Date(year, month - 1, day, hours, minutes, seconds)

  const { v4: uuidv4 } = require('uuid');
  const pmeId = uuidv4();

  try {

      const getId = await pool.query(`
        SELECT
            id
        FROM
            "empresas"
        WHERE
            integrador = false 
        AND
            "nomeFantasia" = $1
        AND
            ativo = true;
        `,[empresa])

      console.log(dataImportacao)

      const result = await pool.query(
        `INSERT INTO "dadosEnergeticos"(
            id,
            "dataImportacao",
            "tensaoEletrica",
            "correnteEletrica",
            frequencia,
            "fatorPotencia",
            harmonicas,
            "energiaAtiva",
            "energiaReativa",
            "energiaAparente",
            "energiaInjetada",
            "demandaAtiva",
            "demandaReativa",
            "demandaAparente",
            alarmes,
            "naoConformidade",
            empresa) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
        [
            pmeId,
            isoDate,
            tensaoEletrica,
            correnteEletrica,
            frequencia,
            fatorPotencia,
            harmonicas,
            energiaAtiva,
            energiaReativa,
            energiaAparente,
            energiaInjetada,
            demandaAtiva,
            demandaReativa,
            demandaAparente,
            alarmes,
            naoConformidade,
            getId.rows[0].id,
        ]
      );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
    res.status(500).json({ error: 'Erro ao inserir dados' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
