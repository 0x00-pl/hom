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
    function normal_node(node, ret){
        let binds = Array.filter(node.attributes, attr=>attr.name.startsWith('plb:'))
            .map(attr=>[caml_case(attr.name.substr(4)), attr.value])
        binds.forEach(([prop, path])=>{
            ret[path] = ret[path] || []
            ret[path].push((value, path, root)=>node[prop]=value)
        })
        // node.childNodes.forEach(child_node=>collect_relations(child_node, ret))
    }
})
