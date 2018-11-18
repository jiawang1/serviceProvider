const express= require('express');
const path= require('path');


const start = controller =>{
  const app = express();
  const router = express.Router();

  const PORT = '9090';

  if(require.resolve){
    console.log(require.resolve('express'));
  }

  router.use(express.static(path.resolve(__dirname, '..', 'build'), { maxAge: '30d' }));

  app.use(router);

  app.listen(PORT, error => {
    if (error) {
      return console.log('server side error', error);
    }
    console.log('web configuration listening on ' + PORT + '...');
  });
};

module.exports = start;
