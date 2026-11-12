
import { firebaseAuth } from '../config/firebase.js';
import { col } from '../config/db.js';
import { HttpError, asyncHandler } from '../utilities/httpError.js';

export const verifyToken = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing authentication token');
  }

  let decoded;

  try {
    decoded = await firebaseAuth.verifyIdToken(authorization.slice(7));
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const user = await col('users').findOneAndUpdate(
    { firebaseUid: decoded.uid },
    {
      $setOnInsert: {
        firebaseUid: decoded.uid,
        email: decoded.email ?? null,
        name: decoded.name ?? '',
        photoURL: decoded.picture ?? null,
        status: 'active',
        platformRole: 'user',
        createdAt: new Date(),
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    }
  );

  if (user.status !== 'active') {
    throw new HttpError(403, 'Account deactivated');
  }

  // Identity and roles come only from the database, never from the client.
  req.user = user;

  next();
});

export const requirePlatformAdmin = (req, _res, next) => {
  if (req.user?.platformRole === 'admin') {
    return next();
  }

  next(new HttpError(403, 'Platform admin only'));
};
