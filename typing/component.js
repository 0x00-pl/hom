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
    function replace_node(anchor, node){
        anchor.parentNode.replaceChild(node, anchor)
    }
    function text_node(node, ret){
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
    }
    function normal_node(node, ret, component_dom_maker){
        let binds = Array.filter(node.attributes, attr=>attr.name.startsWith('plb:'))
            .map(attr=>[caml_case(attr.name.substr(4)), attr.value])
        binds.forEach(([prop, path])=>{
            ret[path] = ret[path] || []
            ret[path].push((value, path, root)=>node[prop]=value)
        })
        node.childNodes.forEach(child_node=>collect_node(child_node, ret))
    }
    function component_node(node, ret, component_dom_maker){
        let tagName = node.tagName.substr(4)
        let component_dom_maker = component_dom_maker[tagName] || function(){ throw `NotImplmentError: component ${tagName}` }
        let props = Array.map(attr=>[caml_case(attr.name), attr.value])
        let [component, new_node] = component_dom_maker(props)
        replace_node(node, new_node)
        props.forEach(([prop, value])=>{
            let path = `${node.__name__}.${prop}`
            ret[path] = ret[path] || []
            ret[path].push((value, path, root)=>component[prop]=value)
        })
    }
    function collect_node(node, ret, component_dom_maker){
        ret = ret || {}
        if(node.nodeType == Node.TEXT_NODE){
            text_node(node, ret)
        } else if(node.nodeType == Node.ELEMENT_NODE){
            let tagName = node.tagName.startsWith
            if(tagName.startsWith('PLB:')){
                component_node(node, ret, component_dom_maker)
            } else {
                normal_node(node, ret, component_dom_maker)
            }
        }
    }

    function build_proxy(obj, setter){
        let handler = {
            set(o, prop, value){
                o[prop] = value
                if(!prop.startsWith('__')){
                    setter(`${o.__name__}.${prop}`, value, obj)
                }
                return true
            },
            get(o, prop){
                let op = (o.__unproxy__)[prop]
                op.__name__ = `${o.__name__}.${prop}`
                op.__unproxy__ = o[prop]

                if(prop.startsWith('__')){
                    return op
                }

                if(op instanceof Object){
                    return new Proxy(op, handler)
                } else {
                    return op
                }
            }
        }
        return new Proxy(Object.assign({__name__: '', __unproxy__: obj}, obj), handler)
    }

    function make_component(dom, model, props, component_dom_maker){
        let setters = collect_node(dom, {}, component_dom_maker)
        let obj_proxy = build_proxy(Object.assign({}, props, model), setters)
        return obj_proxy
    }
    return { make_component }
})
