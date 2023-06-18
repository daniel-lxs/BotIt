import jwt, { JwtPayload } from 'jsonwebtoken';

import { LemmyHttp } from 'lemmy-js-client';

export async function getJwt(
  client: LemmyHttp,
  currentJwt?: string
): Promise<string> {
  if (!currentJwt || isJwtOutdated(currentJwt)) {
    const username = process.env.LEMMY_USER;
    const password = process.env.LEMMY_PASS;

    if (!username || !password) {
      throw new Error('Invalid username or password');
    }

    const loginResponse = await client.login({
      username_or_email: username,
      password,
    });
    if (!loginResponse.jwt) {
      throw new Error('Lemmy login failed');
    }
    return loginResponse.jwt;
  }
  return currentJwt;
}

function isJwtOutdated(jwtToken: string): boolean {
  const decodedToken = jwt.decode(jwtToken) as JwtPayload;
  const expirationTime = decodedToken?.exp;

  if (expirationTime === undefined) {
    return false; // No expiration claim found, JWT is considered valid indefinitely
  }

  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

  if (currentTime > expirationTime) {
    return true; // JWT is outdated
  } else {
    return false; // JWT is still valid
  }
}
