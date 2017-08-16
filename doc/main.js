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
            content.map(v=>dom(...v)).forEach(d=>ret.appendChild(d))
        }

        return ret
    }

    function remove_all_child(node){
        while(node.firstChild){
            node.removeChild(node.firstChild)
        }
    }

    function render_chapter_list(chapter_list, target){
        let list = dom('div', {}, chapter_list.map(([name, url])=>{
            return ['a', {href: url}, name]
        }))
        remove_all_child(target)
        target.appendChild(list)
    }

    function fetch_chapter_list(prefix){
        prefix = prefix || ''
        return fetch(prefix+'chapter_list.api').then(b=>b.json())
    }

    return ()=>{
        fetch_chapter_list().then(j=>{
            let target = document.getElementsByClassName('chapter_list')[0]
            render_chapter_list(j, target)
            console.log(target)
        })
    }
})
