
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

  console.log(alarmId)
  console.log(req.body)

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
            Number(priority == undefined ? 0 : priority.toFixed(2)),
            cause,
            Number(causeValue == undefined ? 0 : causeValue.toFixed(2)),
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
            dataImportacao,
            Number(tensaoEletrica == undefined ? 0 : tensaoEletrica.toFixed(2)),
            Number(correnteEletrica == undefined ? 0 : correnteEletrica.toFixed(2)),
            Number(frequencia == undefined ? 0 : frequencia.toFixed(2)),
            Number(fatorPotencia == undefined ? 0 : fatorPotencia.toFixed(2)),
            Number(harmonicas == undefined ? 0 : harmonicas.toFixed(2)),
            Number(energiaAtiva == undefined ? 0 : energiaAtiva.toFixed(2)),
            Number(energiaReativa == undefined ? 0 : energiaReativa.toFixed(2)),
            Number(energiaAparente == undefined ? 0 : energiaAparente.toFixed(2)),
            Number(energiaInjetada == undefined ? 0 : energiaInjetada.toFixed(2)),
            Number(demandaAtiva == undefined ? 0 : demandaAtiva.toFixed(2)),
            Number(demandaReativa == undefined ? 0 : demandaReativa.toFixed(2)),
            Number(demandaAparente == undefined ? 0 : demandaAparente.toFixed(2)),
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
