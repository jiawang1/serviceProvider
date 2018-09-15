/*
* format of the router :
    {
        target:  regexp for url
        cb: handler callback
    }
*
*/
const wrapRoute = (obj, next)=>{
    return function(req,res){
        if(obj.target.test(req.url)){
            obj.cb(req,res, obj.target,next);
        }else{
            next(req,res);
        }
    }
};

const composeRoute = (...items)=>{
   return  items.reduceRight((pre, cur)=>wrapRoute(cur, pre), wrapRoute(items[items.length-1]));
};

const constructRoute = (aConfig)=>(req, res)=>{
    composeRoute(...aConfig)(req,res);
};

export default constructRoute;
