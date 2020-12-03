import jwt from 'jsonwebtoken';
import util from 'util';

const sign = util.promisify(jwt.sign);
const versions = new Map();

const unknownVersion = _ => __ => {
  return Promise.reject({ message: "Unknown version of the API" });
};

versions.set(1.0, secret => async ({ claims, options = {} }) => {
  const opts = {
    algorithm: 'HS256',
  };
  if (options.expiresIn) opts.expiresIn = options.expiresIn;
  if (options.id) opts.jwtid = options.id;
  if (options.notBefore) opts.notBefore = options.notBefore;
  return await sign(claims, secret, opts);
});


export const makeFactory = secret => version => {
  const creator = versions.get(version) || unknownVersion;
  return creator(secret);
}
