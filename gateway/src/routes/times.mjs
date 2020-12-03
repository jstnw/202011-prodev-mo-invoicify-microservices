import safe from 'express-async-handler';
import moment from 'moment';

function register(app) {
  app.post('/times/:id/close-time', safe(async (req, res) => {
    const { day, end } = req.body;
    const endDate = end ? moment(`${day} ${end}`) : null;
    const timeId = req.params.id;

    await app.locals.pool.query(`
      UPDATE times
      SET ended_at = $1
      WHERE id = $2
    `, [endDate, timeId]);

    res.redirect('/');
  }));

  app.post('/times/add', safe(async (req, res) => {
    const { clientId, day, start, end } = req.body;
    const startDate = moment(`${day} ${start}`);
    const endDate = end ? moment(`${day} ${end}`) : null;

    await app.locals.pool.query(`
      INSERT INTO times (started_at, ended_at, client_id)
      VALUES ($1, $2, $3);
    `, [startDate, endDate, clientId]);

    res.redirect('/');
  }));
}

export default { register };
