/* // api/insert.js

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

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

module.exports = async (req, res) => {
  const { empresa, dataImportacao, tensaoEletrica, correnteEletrica, frequencia, fatorPotencia, harmonicas, energiaAtiva, energiaReativa, energiaAparente, energiaInjetada, demandaAtiva, demandaReativa, demandaAparente, alarmes, naoConformidade } = req.body;
  const pmeId = uuidv4();

  try {
    const getId = await pool.query(` 
      SELECT id
      FROM "empresas"
      WHERE integrador = false 
      AND "nomeFantasia" = $1
      AND ativo = true;
    `, [empresa]);

    const result = await pool.query(
      `INSERT INTO "dadosEnergeticos"(
        id, "dataImportacao", "tensaoEletrica", "correnteEletrica", frequencia, "fatorPotencia", harmonicas, "energiaAtiva", "energiaReativa", "energiaAparente", "energiaInjetada", "demandaAtiva", "demandaReativa", "demandaAparente", alarmes, "naoConformidade", empresa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        pmeId, dataImportacao, Number(tensaoEletrica), Number(correnteEletrica), Number(frequencia), Number(fatorPotencia), Number(harmonicas), Number(energiaAtiva), Number(energiaReativa), Number(energiaAparente), Number(energiaInjetada), Number(demandaAtiva), Number(demandaReativa), Number(demandaAparente), alarmes, naoConformidade, getId.rows[0].id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
    res.status(500).json({ error: 'Erro ao inserir dados' });
  }
}; */

export default function handler(req, res) {
  res.status(200).send('hello world');
}