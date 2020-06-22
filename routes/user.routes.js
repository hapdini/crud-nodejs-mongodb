const controller = require('../controllers/user.controller');
const validateToken = require('../utils/jwt.util').validateToken;

module.exports = (router) => {
    router.route('/login')
        .post(controller.login);

    router.route('/users')
        .post(validateToken, controller.add)
        .get(validateToken, controller.getAll); // This route is now protected

    router.route('/users/accountNumber/:accountNumber')
        .get(validateToken, controller.getByAccountNumber);

    router.route('/users/identityNumber/:identityNumber')
        .get(validateToken, controller.getByIdentityNumber);

    router.route('/users/:userId')
        .put(validateToken, controller.update)
        .delete(validateToken, controller.delete);
};