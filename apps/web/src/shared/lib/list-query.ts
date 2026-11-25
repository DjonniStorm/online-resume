import { parseAsInteger, parseAsString } from 'nuqs';

export const listQueryParsers = {
  q: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
};
