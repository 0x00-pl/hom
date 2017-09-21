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
    // model to events
    function create_model(base_obj, setter){
        let handler = {
            set(o, prop, value){
                o[prop] = value
                setter(`${o.__name__}.${prop}`, value)
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
        if(node.nodeType == Node.TEXT_NODE){
            // TODO
            return
        }
        let binds = Array.filter(node.attributes, attr=>attr.name.startsWith('plb:')).map(attr=>[caml_case(attr.name.substr(4)), attr.value])
        binds.forEach(([prop, source])=>{
            ret[source] = ret[source] || []
            ret[source].push([node, prop])
        })
        node.childNodes.forEach(child_node=>collect_relations(child_node, ret))
    }

    function build_setter(dom){
        let targets = {}
        collect_relations(dom, targets)

        return function(path, value){
            if(targets[path]) targets[path].forEach(([node, prop])=>{
                node[prop] = value
            })
        }
    }

    function bind_model(dom, base_obj){
        let setter = build_setter(dom)
        let ret = create_model(base_obj, setter)
        Object.entries(ret).forEach(([k,v])=>{ret[k]=v})
        return ret
    }

    return { bind_model }
})
