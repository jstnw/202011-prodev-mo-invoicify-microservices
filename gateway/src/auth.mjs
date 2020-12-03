import fetch from 'node-fetch';
import CircuitBreaker from 'opossum';

const breakerOptions = {
  timeout: 1000,
  resetTimeout: 5000,
};

export const identify = pool => async (req, res, next) => {
  const { token } = req.cookies;

  try {
    const response = await fetch('http://jwt-maker/api/tokens/valid', {
      method: 'put',
      headers: {
        'X-Service-Version': 1.0,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw { status: response.status };
    }
    const payload = await response.json();
    const { claims: { email } } = payload;
    const { rows } = await pool.query(`SELECT id FROM people WHERE email = $1`, [email]);
    if (!rows.length) {
      return res.redirect('/login');
    }
    res.locals.user = {
      id: rows[0].id,
      email
    };
    next();
  } catch (e) {
    console.error(`Identify Error:`, e);
    res.redirect('/login')
  }
};

let investBreaker;

export const invest = () => {
  function checkToken(email, res) {
    return fetch('http://jwt-maker/api/tokens', {
      method: 'post',
      headers: {
        'X-Service-Version': 1.0,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claims: { email } }),
    })
      .then(response => {
        if (response.ok) return response;
        throw { message: `Response is ${response.status}` };
      })
      .then(response => response.json())
      .then(({ token }) => {
        res.cookie('token', token, { httpOnly: true });
      });
  }

  if (!investBreaker) {
    investBreaker = new CircuitBreaker(checkToken, breakerOptions);
  }

  return (email, res) => {
    if (investBreaker.opened) {
      return Promise.reject({ code: 100, message: 'Circuit opened.' });
    }
    return investBreaker.fire(email, res);
  }
};

export const authMiddleware = (pool, failure) => {
  const authBreaker = new CircuitBreaker(identify(pool), breakerOptions);

  return (req, res, next) => {
    if (authBreaker.opened) {
      return failure(req, res);
    }
    authBreaker.fire(req, res, next);
  }
}
