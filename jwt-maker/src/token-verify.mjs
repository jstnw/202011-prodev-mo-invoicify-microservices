import jwt from 'jsonwebtoken';
import util from 'util';

const verify = util.promisify(jwt.verify);
const versions = new Map();

const unknownVersion = _ => __ => {
  return Promise.reject({ message: "Unknown version of the API" });
};

versions.set(1.0, secret => async token => {
  try {
    return await verify(token, secret, { algorithm: 'HS256' });
  } catch (e) {
    throw { code: 404, message: 'Invalid token' };
  }
});


export const verifyFactory = secret => version => {
  const verifier = versions.get(version) || unknownVersion;
  return verifier(secret);
}
