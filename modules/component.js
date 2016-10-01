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
    function refreash(model){
        Object.keys(model).forEach((k)=>{
            if(k.startsWith('__')){ return }

            let v = model[k]
            model[k] = v
            if(v instanceof Object){
                refreash(v)
            }
        })
    }
    function text_node(node, ret){
        let text = node.nodeValue
        let binds = text.match(/\{\{.+?\}\}/g) || []
        // console.log('[debug]: text_node: <<<', node.nodeValue, '>>>', binds)
        function update(value, source, root){
            // console.log('[debug]: update text', value, source, root)
            let r = text
            binds.forEach(v=>{
                let path = v.substring(2, v.length-2)
                r = r.replace(v, deep_get(root, source))
                node.nodeValue = r
            })
        }
        binds.forEach(v=>{
            let path = v.substring(2, v.length-2)
            ret[path] = ret[path] || []
            ret[path].push(update)
            // console.log('[debug]: binds push: ', path)
        })
    }
    function normal_node(node, ret, component_dom_maker){
        let binds = Array.filter(node.attributes, attr=>attr.name.startsWith('plb:'))
            .map(attr=>[caml_case(attr.name.substr(4)), attr.value])
        binds.forEach(([prop, path])=>{
            ret[path] = ret[path] || []
            ret[path].push((value, path, root)=>node[prop]=value)
        })
        node.childNodes.forEach(child_node=>collect_node(child_node, ret, component_dom_maker))
    }
    function component_node(node, ret, component_dom_maker){
        let tagName = node.tagName.substr(4)
        let cur_component_dom_maker = component_dom_maker[tagName] || function(){ throw `NotImplmentError: component ${tagName}` }
        let props = {}
        Array.forEach(node.attributes, attr=>props[caml_case(attr.name)]=attr.value)
        let [model, new_node] = cur_component_dom_maker(props, node)
        replace_node(node, new_node)
        Object.entries(props).forEach(([prop, value])=>{
            let path = `${node.__name__}.${prop}`
            ret[path] = ret[path] || []
            ret[path].push((value, path, root)=>model[prop]=value)
        })
    }
    function collect_node(node, ret, component_dom_maker){
        ret = ret || {}
        if(node.nodeType == Node.TEXT_NODE){
            text_node(node, ret)
        } else if(node.nodeType == Node.ELEMENT_NODE){
            let tagName = node.tagName
            if(tagName.startsWith('PLB:')){
                component_node(node, ret, component_dom_maker)
            } else {
                normal_node(node, ret, component_dom_maker)
            }
        }
    }
    function make_setter(collection){
        return function(path, value, root){
            if(collection[path]) collection[path].forEach(cb=>{
                cb(value, path, root)
            })
        }
    }

    function build_proxy(obj, setter){
        let new_obj = Object.assign({__name__: ''}, obj)
        let handler = {
            set(o, prop, value){
                let vup = value.__unproxy__ || value
                o[prop] = vup
                // console.log('[debug]: setting: ', `${o.__name__}.${prop}`, vup, o, new_obj, o==new_obj)
                if(!prop.startsWith('__')){
                    setter(`${o.__name__}.${prop}`, value, new_obj)
                }
                return true
            },
            get(o, prop){
                // console.log('[debug]: getting: ', `${o.__name__}.${prop}`, o[prop])
                if(prop == '__unproxy__'){
                    return o
                }
                if(prop.startsWith('__')){
                    return o[prop]
                }
                let op = o[prop]
                // console.log('[debug]: op: ', op)

                op.__name__ = op.__name__ || `${o.__name__}.${prop}`

                if(op instanceof Object){
                    return new Proxy(op, handler)
                } else {
                    return op
                }
            }
        }
        return new Proxy(new_obj, handler)
    }

    function make_component(dom, model, component_dom_maker){
        let collection = {}
        collect_node(dom, collection, component_dom_maker)
        let setter = make_setter(collection)
        // console.log('[debug]: setters ', setter)
        let new_model = build_proxy(model, setter)
        // console.log('[debug]: model ', model)
        refreash(new_model)
        return new_model
    }
    return { make_component }
})
