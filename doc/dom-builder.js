define(['tools', 'document'], (tools, document)=>{
    function dom(tagname, attr_list, content){
        tagname = tagname || 'div'
        attr_list = attr_list || {}
        content = content || []

        let ret = document.createElement(tagname)
        tools.object_map(attr_list, (v,k)=>{
            ret.setAttribute(k, v)
        })

        if(typeof content === 'string'){
            let text = document.createTextNode(content)
            ret.appendChild(text)
        } else {
            if(content.length === 3 && typeof content[0] === 'string'){
                ret.appendChild(dom(...content))
            } else {
                content.map(v=>dom(...v)).forEach(d=>ret.appendChild(d))
            }
        }

        return ret
    }
    function style(selector, dict){
        return selector + Array.from('{}').join(tools.object_map(dict, (v,k)=>String(k)+':'+String(v)+';\n'))
    }
    // TODO style bind to dom
      return {dom, style}
})

