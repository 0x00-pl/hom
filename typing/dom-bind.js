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
        let bind_dict = fake_env_eval(';('+dom_attr_str+');')
        let bind_dict_rev = Object.entries(bind_dict).reduce((acc,[k,v])=>{
            acc[v] = acc[v] || []
            acc[v].push(k)
            return acc
        }, {})
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

    function dom_bind_to_functions(dom, functions){
        let observer = new MutationObserver(function(mutations) {
            console.log('on observe')
            mutations.forEach(function(mutation) {
                let attr_name = mutation.attributeName
                console.log(mutation.type, attr_name, mutation.target[attr_name])
                // if(functions[attr_name]){
                //     functions[attr_name](mutation)
                // }
            })
        })
        let config = { attributes: true, characterData: true }

        observer.observe(dom, config)
        console.log('observe')
        dom.value = 1234
        dom.setAttribute('vattr', 1234)
    }

    return { hook_obj, hook_obj_rec, notify_handlers, obj_pipe_dom, obj_bind_to_dom, dom_bind_to_functions }
})
