import { passwordRegex } from "./password-regex";

describe('Password regex', () => {
	it('should return false if length is under 10 characters', () => {
		const short = 'Too$4ort';
		expect(passwordRegex.test(short)).toBeFalsy();
	});

	it('should return false if there is no uppercase letter', () => {
		const tooSmall = 'reallyt00$mall';
		expect(passwordRegex.test(tooSmall)).toBeFalsy();
	});

	it('should return false if there is no lowercase letter', () => {
		const noLower = 'AGGRE$$1VE';
		expect(passwordRegex.test(noLower)).toBeFalsy();
	});

	it('should return false if there is no number', () => {
		const NoNumber = 'NoNumb€rNo';
		expect(passwordRegex.test(NoNumber)).toBeFalsy();
	});

	it('should return false if there is no special character', () => {
		const notSpecial = 'Not5pecial';
		expect(passwordRegex.test(notSpecial)).toBeFalsy();
	});

	it('should return true if it is 10 or more characters long, & has at elast 1 uppercase, 1 lowercase, 1 number and 1 special char', () => {
		const exact = '1234567Aa$'
		const longerExact = '10Characters+';
		expect(passwordRegex.test(exact)).toBeTruthy();
		expect(passwordRegex.test(longerExact)).toBeTruthy();
	});
})
