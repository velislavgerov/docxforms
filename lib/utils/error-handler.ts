/* eslint-disable prefer-arrow-callback */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */

// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
export function replaceErrors(key: any, value: any) {
  if (value instanceof Error) {
    value = value as any;
      return Object.getOwnPropertyNames(value).reduce((error: any, key: any) => {
        error[key] = value[key];
        return error;
      }, {});
  }
  return value;
}

export default function errorHandler(error: any) {
  console.log(JSON.stringify({error: error}, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map(function (error: any) {
        return error.properties.explanation;
      }).join("\n");
      console.log('errorMessages', errorMessages);
      // errorMessages is a humanly readable message looking like this:
      // 'The tag beginning with "foobar" is unopened'
  }
  throw error;
}
