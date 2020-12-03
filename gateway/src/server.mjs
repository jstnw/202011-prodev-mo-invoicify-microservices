import cookies from 'cookie-parser';
import express from 'express';
import safe from 'express-async-handler';
import helmet from 'helmet';
import moment from 'moment';
import pg from 'pg';
import { authMiddleware } from './auth.mjs';
import authenticationRoutes from './routes/authentication.mjs';
import clientRoutes from './routes/clients.mjs';
import invoiceRoutes from './routes/invoices.mjs';
import registrationRoutes from './routes/registration.mjs';
import timesRoutes from './routes/times.mjs';

const { Pool } = pg;
const pool = new Pool();
const app = express();
const port = Number.parseInt(process.env.PORT);
const auth = authMiddleware(pool, (_, res) => res.redirect('/out-of-order'));

app.set('view engine', 'pug');
app.set('views', './src/views');

app.locals.pool = pool;

app.use(cookies());
app.use(helmet());
app.use(express.urlencoded());

app.get('/out-of-order', (_, res) => {
  res.render('out-of-order.pug');
});

authenticationRoutes.register(app);
registrationRoutes.register(app);

app.use(auth);

clientRoutes.register(app);
invoiceRoutes.register(app);
timesRoutes.register(app);

app.get('/', safe(async (_, res) => {
  const unpaidInvoiceQuery = pool.query(`
    SELECT i.id, i.number, c.name AS "clientName", iss.name AS status, iss.id AS "statusId"
    FROM invoices i
    JOIN clients c ON (i.client_id = c.id)
    JOIN invoice_statuses iss ON (i.status_id = iss.id)
    WHERE i.status_id < 3
    AND c.person_id = $1
    ORDER BY i.number
  `, [res.locals.user.id]);
  const clientQuery = pool.query(`
    SELECT c.id, c.name
    FROM clients c
    WHERE c.person_id = $1
    ORDER BY c.name
  `, [res.locals.user.id]);
  const unbilledTimeQuery = pool.query(`
    SELECT DISTINCT c.id, c.name, SUM(EXTRACT(EPOCH FROM age(t.ended_at, t.started_at))) / 3600 as age
    FROM clients c
    JOIN times t ON (t.client_id = c.id)
    LEFT JOIN invoice_items its ON (its.item_id = t.id)
    WHERE c.person_id = $1
    AND its.id IS NULL
    AND t.ended_at IS NOT NULL
    GROUP BY c.name, c.id
    ORDER BY c.name
  `, [res.locals.user.id]);
  const openTimeQuery = pool.query(`
    SELECT t.id, c.name, t.started_at AS "startedAt", t.ended_at AS "endedAt"
    FROM times t
    JOIN clients c ON (t.client_id = c.id)
    WHERE t.ended_at IS NULL
  `);
  const [{ rows: unpaidInvoices }, { rows: unbilledClients }, { rows: openTimes }, { rows: clients }] = await Promise.all([unpaidInvoiceQuery, unbilledTimeQuery, openTimeQuery, clientQuery]);
  if (clients.length === 0) {
    return res.redirect('/clients/new');
  }
  if (openTimes[0]) {
    openTimes[0].startedAt = moment(openTimes[0].startedAt).format('h:mm a, MMM Do, YYYY');
  }
  res.render('index', { unpaidInvoices, unbilledClients, clients, openTime: openTimes[0] });
}));


app.listen(port, () => console.log(`Now listening on ${port}`));
