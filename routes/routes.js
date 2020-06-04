const express = require('express');
const fs = require('fs').promises;

global.fileName = 'grades.json';
const routes = express.Router();

//1
routes.post('/', async (req, res) => {
  try {
    let grade = req.body;
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);
    let time = new Date();

    grade = { id: json.nextId++, ...grade, timestamp: time };
    json.grades.push(grade);

    await fs.writeFile(global.fileName, JSON.stringify(json));
    logger.info(`POST /grades - ${JSON.stringify(grade)}`);

    res.end();
  } catch (err) {
    logger.error(`POST /grades - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

//2
routes.put('/:id', async (req, res) => {
  try {
    let updateGrade = req.body;
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    let oldIndex = json.grades.findIndex(
      (grade) => grade.id === updateGrade.id
    );

    if (oldIndex >= 0) {
      json.grades[oldIndex] = updateGrade;
      await fs.writeFile(global.fileName, JSON.stringify(json));
      logger.info(`PUT /grades - ${JSON.stringify(updateGrade)}`);

      res.end();
    } else {
      throw new Error('Grade não encontrada.');
    }
  } catch (err) {
    logger.error(`PUT /grades - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

//3
routes.delete('/:id', async (req, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const grades = json.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id, 10)
    );
    json.grades = grades;

    await fs.writeFile(global.fileName, JSON.stringify(json));
    logger.info(`DELETE /grades/:id - ${JSON.stringify(req.params.id)}`);

    res.end();
  } catch (err) {
    logger.error(`DELETE /grades/:id - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

//4
routes.get('/:id', async (req, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const grade = json.grades.find(
      (grade) => grade.id === parseInt(req.params.id, 10)
    );

    if (grade) {
      logger.info(`GET /grades/:id - ${JSON.stringify(grade)}`);

      res.send(grade);
    } else {
      logger.info(`GET /grades/:id - SEM RETORNO`);

      res.end;
    }
  } catch (error) {
    logger.error(`GET /grades/:id - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

//5
routes.post('/total-grade', async (req, res) => {
  try {
    let body = req.body;
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const students = json.grades
      .filter((student) => student.student === body.student)
      .filter((subject) => subject.subject === body.subject)
      .reduce((acc, crr) => acc + crr.value, 0);

    logger.info(`POST /grades/total-grade - ${students}`);

    res.send(`Soma da notas: ${students}`);
  } catch (err) {
    logger.error(`POST /grades/total-grade - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

//6
routes.post('/rate', async (req, res) => {
  try {
    let body = req.body;
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const subjects = json.grades.filter(
      (subject) => subject.subject === body.subject
    );

    const types = subjects.filter((type) => type.type === body.type);

    let totalGrades = types.reduce((acc, crr) => acc + crr.value, 0);

    let rate = totalGrades / types.length;
    console.log(types.length);
    logger.info(`POST /grades/rate - ${rate}`);

    res.send(`Média das notas: ${rate}`);
  } catch (err) {
    logger.error(`POST /grades/rate - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

//7
routes.post('/better-grades', async (req, res) => {
  try {
    let body = req.body;
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);

    const subjects = json.grades
      .filter((subject) => subject.subject === body.subject)
      .filter((type) => type.type === body.type)
      .map((value) => value.value)
      .sort((a, b) => b - a)
      .slice(0, 3);

    logger.info(`POST /better-grades - ${subjects}`);

    res.send(`Três maiores notas do tema ${body.subject}: ${subjects}`);
  } catch (err) {
    logger.error(`POST /better-grades - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

routes.get('/', async (_, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf-8');
    let json = JSON.parse(data);
    delete json.nextId;
    logger.info(`GET /grades`);

    res.send(json);
  } catch (err) {
    logger.error(`GET /grades - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

module.exports = routes;
