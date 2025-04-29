/**
  * @description
  * ensures 10 or more characters,
  * including at least:
  * 1 special character (#@$%^&+=*)
  * 1 number 
  * 1 lowercase 
  * 1 uppercase
*/
export const passwordRegex = /^(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[#@$%^&+=*]).*$/;

/**
  * @description
  * checks if string matches UUID pattern 
  * & length (36 characters.)
*/
export const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
  * @description
  * checks if string matches hex SHA-256
  * 64 characters & only hexadecimal
*/
export const hashRegex = /^[0-9a-f]{64}$/i;
