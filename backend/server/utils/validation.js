export const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => {
  const lowerCaseEmail = email.toLowerCase();
  return validEmailPattern.test(lowerCaseEmail);
};
