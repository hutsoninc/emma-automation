var app = require('./app');

exports.webhookRoutes = function(router){
  router.post('/emma-lg-equipment', app.handleImport);
};