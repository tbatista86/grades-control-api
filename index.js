const express = require('express');
const fs = require('fs').promises;
const Routes = require('./routes/routes.js');
const winston = require('winston');

const app = express();

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

app.use(express.json());
app.use('/grades', Routes);

app.listen(3000, async () => {
  try {
    await fs.readFile(global.fileName, 'utf-8');
    logger.info('[Server API] -> ON');
  } catch (error) {
    const initialJson = {
      nextId: 1,
      grades: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson)).catch((err) => {
      logger.error('Error load file: ', err);
    });
  }
});
