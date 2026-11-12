import { ObjectId } from 'mongodb';
import { HttpError } from './httpError.js';

export const toObjectId = (value, label = 'id') => {
  if (
    typeof value !== 'string' ||
    !ObjectId.isValid(value) ||
    String(new ObjectId(value)) !== value
  ) {
    throw new HttpError(400, `Invalid ${label}`);
  }

  return new ObjectId(value);
};
