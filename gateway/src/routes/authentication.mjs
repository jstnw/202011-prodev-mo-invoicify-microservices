import bcrypt from 'bcrypt';
import safe from 'express-async-handler';
import { invest } from '../auth.mjs';

const enlist = invest();

function register(app) {
  app.get('/login', (_, res) => {
    res.render('login');
  });

  app.post('/login', safe(async (req, res) => {
    const { email, password } = req.body;
    const { rows } = await app.locals.pool.query(`
      SELECT password_hash FROM people WHERE email = $1
    `, [email]);
    const passwordHash = (rows[0] && rows[0].password_hash) || '';
    const valid = await bcrypt.compare(password, passwordHash);
    if (valid) {
      try {
        await enlist(email, res);
        res.redirect('/')
      } catch (e) {
        console.error('Login error', e);
        if (e.code === 100) {
          return res.redirect('/out-of-order');
        }
        res.redirect('/login');
      }
    } else {
      console.error(`Failed login with email ${email}`);
      res.redirect('/login');
    }
  }));

  app.post('/logout', (_, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  });
}

export default { register };
