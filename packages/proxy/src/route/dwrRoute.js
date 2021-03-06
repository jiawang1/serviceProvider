'user strict';

const getRoutes = config => {
  return [
    {
      target: new RegExp(/^.*dwr$/), // todo project
      cb: (req, res, pattern,next) => {
        var _end = res.end
        res.end = function end (chunk, encoding) {
          let resText = chunk;
          if(typeof chunk ==='string'){
            const matched = req.bodyData.toString().match(/batchId=(\d+)/);
            if(matched){
              resText = chunk.replace(/_remoteHandleCallback\([^,]*,/, `_remoteHandleCallback('${matched[1]}',`);
            }
          }
          return _end.call(this, resText, encoding)
        }
        next(req,res);
      }
    }
  ];
};

module.exports = getRoutes;
