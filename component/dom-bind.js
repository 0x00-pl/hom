define(['document'], (document)=>{
    function rev_dict(obj){
        return Object.entries(obj).reduce((acc,[k,v])=>{
            acc[v] = acc[v] || []
            acc[v].push(k)
            return acc
        }, {})
    }

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

    function fake_env_eval(code){
        let window = {}, global = {}, module = {}

        window = new Proxy({}, {
            set(o, name, value){
                console.log('capture set:', name, value)
                o[name]=value
                return true
            },
            get(o, name){
                // console.log('capture get: ', name)
                return undefined // disable all access
            },
            has(o, name){
                if(name === 'eval' || name === 'code'){ return false }
                return true // disable all access
            }
        })

        with(window){
            return eval(code)
        }
    }

    function obj_bind_to_dom(obj, dom){

        let dom_attr_str = dom.getAttribute('pl_binds')
        if(!dom_attr_str){ return obj }
        // let bind_dict = fake_env_eval(';('+dom_attr_str+');')
        let bind_dict = JSON.parse(dom_attr_str)
        let bind_dict_rev = rev_dict(bind_dict)
        let new_obj = new Proxy(obj, {
            set(o, name, value){
                o[name] = value
                if(bind_dict_rev[name] != undefined){
                    bind_dict_rev[name].map(attr=>{dom[attr]=value})
                }
            }
        })
        return new_obj
    }

    function dom_bind_to_obj(dom, obj){
        let dom_attr_str = dom.getAttribute('pl_events')
        if(dom_attr_str == undefined){ return }
        let bind_dict = JSON.parse(dom_attr_str)
        if(bind_dict instanceof Array){
            bind_dict.forEach(name=>{
                dom.addEventListener(name, obj[name])
            })
        } else {
            let bind_dict_rev = rev_dict(bind_dict)
            Object.entries(bind_dict_rev).forEach(([k,v])=>{
                dom.addEventListener(k, obj[v])
            })
        }
    }

    function dom_bind_to_functions(dom, functions){
        Object.entries(functions).forEach(([k,v])=>{
            dom.addEventListener(k, v)
        })
    }

    function bind_all(dom, obj){
        let new_obj = obj_bind_to_dom(obj, dom)
        dom_bind_to_obj(dom, new_obj)
    }

    function traced_object(hset){
        let handler = {
            set(o, prop, value){
                o[prop] = value
                hset(`${o.__name__}.${prop}`, value)
                return true
            },
            get(o, prop){
                let op = o[prop]
                op.__name__ = `${o.__name__}.${prop}`
                if(op instanceof Object){
                    return new Proxy(op, handler)
                } else {
                    return op
                }
            }
        }
        return new Proxy({__name__: ''}, handler)
    }


    return { hook_obj, hook_obj_rec, notify_handlers, obj_pipe_dom, obj_bind_to_dom, dom_bind_to_functions, dom_bind_to_obj, bind_all, traced_object }
})
