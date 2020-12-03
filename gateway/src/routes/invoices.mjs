import safe from 'express-async-handler';
import moment from 'moment';

function register(app) {
  app.post('/invoices', safe(async (req, res) => {
    const { timeIds: stimeIds, clientId, number } = req.body;
    const { pool } = app.locals;

    const timeIds = stimeIds.map(x => Number.parseInt(x));

    await pool.query('BEGIN');

    const { rows: [{ id: invoiceId }] } = await pool.query(`
      INSERT INTO invoices (number, client_id, started_at, ended_at)
      SELECT $1, $2, MIN(started_at) AS started_at, MAX(ended_at) as ended_at
      FROM times t
      WHERE t.id = ANY($3)
      RETURNING id
    `, [number, clientId, timeIds]);

    for (let timeId of timeIds) {
      await pool.query(`
        INSERT INTO invoice_items(invoice_id, item_id)
        VALUES ($1, $2)
      `, [invoiceId, timeId]);
    }

    await pool.query('COMMIT');

    return res.redirect('/');
  }));

  app.post('/invoices/:id/status', safe(async (req, res) => {
    const invoiceId = req.params.id;

    await app.locals.pool.query(`
      UPDATE invoices
      SET status_id = status_id + 1
      WHERE id = $1
      AND client_id IN (
        SELECT c.id
        FROM clients c
        WHERE c.person_id = $2
      )
    `, [invoiceId, res.locals.user.id]);

    res.redirect('/');
  }));

  app.get('/invoices/new', safe(async (req, res) => {
    const clientId = Number.parseInt(req.query.clientId);
    if (clientId) {
      const { rows: unbilledTime } = await app.locals.pool.query(`
        SELECT DISTINCT c.id AS "clientId", c.name, t.started_at AS "startedAt", t.ended_at AS "endedAt", t.id
        FROM clients c
        JOIN times t ON (t.client_id = c.id)
        LEFT JOIN invoice_items its ON (its.item_id = t.id)
        WHERE c.person_id = $1
        AND c.id = $2
        AND its.id IS NULL
        AND t.ended_at IS NOT NULL
        ORDER BY c.name
      `, [res.locals.user.id, clientId]);

      if (!unbilledTime.length) {
        return res.redirect('/invoices/new');
      }

      unbilledTime.forEach(x => {
        x.startDay = moment(x.startedAt).format("MMM Do, YYYY");
        x.startTime = moment(x.startedAt).format("h:mm a");
        x.endDay = moment(x.endedAt).format("MMM Do, YYYY");
        x.endTime = moment(x.endedAt).format("h:mm a");
      });
      const client = {
        id: unbilledTime[0].clientId,
        name: unbilledTime[0].name,
      };
      res.render('invoices/add-time.pug', { unbilledTime, client });
    } else {
      const { rows: clients } = await app.locals.pool.query(`
        SELECT c.id, c.name
        FROM clients c
        WHERE c.person_id = $1
        ORDER BY c.name
      `, [res.locals.user.id])
      res.render('invoices/add.pug', { clients });
    }
  }));
}

export default { register };
