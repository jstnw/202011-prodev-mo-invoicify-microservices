import bcrypt from 'bcrypt';
import safe from 'express-async-handler';

import { invest } from '../auth.mjs';

const enlist = invest();

function register(app) {
  app.get('/signup', (_, res) => {
    res.render('signup');
  });

  app.post('/signup', safe(async (req, res) => {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      await app.locals.pool.query(`
        INSERT INTO people(email, password_hash)
        VALUES ($1, $2)
      `, [email, passwordHash]);
    } catch (e) {
      const message = 'That email address is already in use';
      return res.render('signup.pug', { message, email })
    }
    await enlist(email, res);
    res.redirect('/');
  }));
}

export default { register };
