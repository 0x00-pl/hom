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
            if(n.startsWith('__')){ return false }
            if(o[p]===v){ return true }
            let hv = hook_obj_rec(v, notify_handlers)
            o[p] = hv
            ;(o.__set[p]||[]).forEach(x=>x.update())
            return true
        },
        get(o,p){
            if(p.startsWith('__')){ return undefined }
            return o[p]
        }
    }

    function obj_pipe_dom(obj, dom){
        obj.onchange = function(value){dom.value = value}
    }
})
