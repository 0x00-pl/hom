define(['document'], (document)=>{
    function caml_case(str){
        return str.replace(/_a/g, "A")
            .replace(/_b/g, "B")
            .replace(/_c/g, "C")
            .replace(/_d/g, "D")
            .replace(/_e/g, "E")
            .replace(/_f/g, "F")
            .replace(/_g/g, "G")
            .replace(/_h/g, "H")
            .replace(/_i/g, "I")
            .replace(/_j/g, "J")
            .replace(/_k/g, "K")
            .replace(/_l/g, "L")
            .replace(/_m/g, "M")
            .replace(/_n/g, "N")
            .replace(/_o/g, "O")
            .replace(/_p/g, "P")
            .replace(/_q/g, "Q")
            .replace(/_r/g, "R")
            .replace(/_s/g, "S")
            .replace(/_t/g, "T")
            .replace(/_u/g, "U")
            .replace(/_v/g, "V")
            .replace(/_w/g, "W")
            .replace(/_x/g, "X")
            .replace(/_y/g, "Y")
            .replace(/_z/g, "Z")
    }
    function deep_get(root, path){
        let toks = path.split('.').filter(a=>a.length!=0)
        return toks.reduce((acc,v)=>{
            return acc[v]
        }, root)
    }
    // model to events
    function create_model(base_obj, setter){
        let handler = {
            set(o, prop, value){
                o[prop] = value
                setter(`${o.__name__}.${prop}`, value, base_obj)
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
        return new Proxy(Object.assign({__name__: ''}, base_obj), handler)
    }
    // from dom build events applyer
    function collect_relations(node, ret){
        if(node.nodeType == Node.ELEMENT_NODE && node.tagName.startsWith('PLB:')){
            let binds = {}
            Array.forEach(node.attributes, (attr)=>binds[attr.name]=attr.value)
            console.log(binds)
        }else if(node.nodeType == Node.TEXT_NODE){
            let text = node.nodeValue
            let binds = text.match(/\$\{.+?\}/g) || []
            function update(value, source, root){
                let r = text
                binds.forEach(v=>{
                    let path = v.substring(2, v.length-1)
                    r = r.replace(v, deep_get(root, source))
                    node.nodeValue = r
                })
            }
            binds.forEach(v=>{
                let path = v.substring(2, v.length-1)
                ret[path] = ret[path] || []
                ret[path].push(update)
            })
        } else {
            let binds = Array.filter(node.attributes, attr=>attr.name.startsWith('plb:'))
                .map(attr=>[caml_case(attr.name.substr(4)), attr.value])
            binds.forEach(([prop, path])=>{
                ret[path] = ret[path] || []
                ret[path].push((value, path, root)=>node[prop]=value)
            })
            node.childNodes.forEach(child_node=>collect_relations(child_node, ret))
        }
    }

    function build_setter(dom){
        let targets = {}
        collect_relations(dom, targets)

        return function(path, value, root){
            console.log('set: ', path, value)
            if(targets[path]) targets[path].forEach(cb=>{
                cb(value, path, root)
            })
        }
    }

    function refreash(model){
        Object.entries(model).forEach(([k,v])=>{
            model[k] = v
            if(v instanceof Object){
                refreash(v)
            }
        })
    }
    function bind_model(dom, base_obj){
        let setter = build_setter(dom)
        let ret = create_model(base_obj, setter)
        // Object.entries(ret).forEach(([k,v])=>{ret[k]=v})
        refreash(ret)
        return ret
    }

    return { bind_model }
})
