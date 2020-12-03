import safe from 'express-async-handler';

function register(app) {
  app.post('/clients', safe(async (req, res) => {
    const { name } = req.body;
    await app.locals.pool.query(`
      INSERT INTO clients (name, person_id)
      VALUES ($1, $2);
    `, [name, res.locals.user.id]);
    res.redirect('/');
  }));

  app.get('/clients/new', (_, res) => {
    res.render('clients/add.pug');
  });
}

export default { register };
