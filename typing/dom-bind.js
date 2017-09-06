define(['document'], (document)=>{
    function hook_obj(obj, handles){
        handles = handles || {}
        return new Proxy(obj, handles)
    }

    function hook_obj_rec(obj, handles){
        if(obj instanceof Object){
            let ret = {}
            Object.entries(obj).forEach(([k,v])=>{
                ret[k] = hook_obj_rec(v, handles)
            })
            return hook_obj(ret, handles)
        } else {
            return obj
        }
    }

    let notify_handlers = {
        set(o,p,v){
            if(o[p]===v){ return true }
            if(!p.startsWith('__')){
                o.__set = o.__set || {}
                let hv = hook_obj_rec(v, notify_handlers)
                let funcs = o.__set[p] || []
                funcs.forEach(f=>f(v))
                o[p] = hv
            } else {
                o[p] = v
            }
            return true
        },
        get(o,p){
            // if(p.startsWith('__')){ return undefined }
            return o[p]
        }
    }

    function obj_pipe_dom(obj, name, dom, prop){
        obj.__set = obj.__set || {}
        obj.__set[name] = [].concat((obj.__set[name]||[]), [(v)=>{dom[prop]=v}])

        return obj

        // if(obj instanceof Proxy){
        //     return obj
        // } else {
        //     return hook_obj_rec(obj, notify_handlers)
        // }
    }

    return { hook_obj, hook_obj_rec, notify_handlers, obj_pipe_dom }
})
