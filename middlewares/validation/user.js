const { check, validationResult } = require('express-validator');

exports.validateUserSignUp = [
  check('email').normalizeEmail().isEmail().withMessage('Invalid email!'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is empty!')
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be 8 to 20 characters long!'),
  check('confirmPassword')
    .trim()
    .not()
    .isEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Both password must be same!');
      }
      return true;
    }),
];

exports.userVlidation = (req, res, next) => {
  const result = validationResult(req).array();
  console.log(result);
  if (!result.length) return next();
  const error = result[0].msg;
  res.json({ success: false, message: error });
};

exports.validateUserSignIn = [
  check('email').trim().isEmail().withMessage('email is required!'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('password is required!'),
];
