const { validateEmail, validatePassword, isLoginFormValid } = require('../src/utils/validation');

console.log('--- TESTING EMAIL VALIDATION ---');
const emailCases = [
  { input: '', expected: 'Email is required.' },
  { input: '   ', expected: 'Email is required.' },
  { input: 'user@yahoo.com', expected: 'Please enter a valid Gmail address.' },
  { input: 'user@outlook.com', expected: 'Please enter a valid Gmail address.' },
  { input: 'user@hotmail.com', expected: 'Please enter a valid Gmail address.' },
  { input: 'invalid-email', expected: 'Please enter a valid Gmail address.' },
  { input: 'astronaut@gmail.com', expected: '' },
  { input: 'user.name+test@gmail.com', expected: '' },
];

let emailPassed = 0;
emailCases.forEach(({ input, expected }) => {
  const result = validateEmail(input);
  if (result === expected) {
    emailPassed++;
    console.log(`[PASS] Email "${input}" -> "${result}"`);
  } else {
    console.error(`[FAIL] Email "${input}" -> Expected "${expected}", got "${result}"`);
  }
});

console.log(`\nEmail Validation: ${emailPassed}/${emailCases.length} passed.`);

console.log('\n--- TESTING PASSWORD VALIDATION ---');
const passwordCases = [
  { input: '', expected: 'Password is required.' },
  { input: 'Short1!', expected: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' },
  { input: 'nouppercase1!', expected: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' },
  { input: 'NOLOWERCASE1!', expected: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' },
  { input: 'NoNumberSpec!', expected: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' },
  { input: 'NoSpecial123', expected: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' },
  { input: 'Password123!', expected: '' },
  { input: 'Complex@Pass9', expected: '' },
];

let passwordPassed = 0;
passwordCases.forEach(({ input, expected }) => {
  const result = validatePassword(input);
  if (result === expected) {
    passwordPassed++;
    console.log(`[PASS] Password "${input}" -> "${result}"`);
  } else {
    console.error(`[FAIL] Password "${input}" -> Expected "${expected}", got "${result}"`);
  }
});

console.log(`\nPassword Validation: ${passwordPassed}/${passwordCases.length} passed.`);

console.log('\n--- TESTING FORM VALIDITY ---');
console.log('Valid combo:', isLoginFormValid('astronaut@gmail.com', 'Password123!')); // true
console.log('Invalid email:', isLoginFormValid('astronaut@yahoo.com', 'Password123!')); // false
console.log('Invalid pass:', isLoginFormValid('astronaut@gmail.com', 'simplepass')); // false

if (emailPassed === emailCases.length && passwordPassed === passwordCases.length) {
  console.log('\nALL VALIDATION TESTS PASSED SUCCESSFULY!');
} else {
  process.exit(1);
}
