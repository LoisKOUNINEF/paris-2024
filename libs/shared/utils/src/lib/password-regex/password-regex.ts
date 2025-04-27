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
