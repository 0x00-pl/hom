define(['component', 'document'], (comp, document)=>{
    return function(props){
        // console.log('[debug]: create counter')
        let base = props.base || 0
        let node = document.createElement('div')
        node.innerHTML = `
<h1>counter example {{.sum}}</h1>
<button plb:text_content=".sum" plb:onClick=".click"></button>
`
        let model = comp.make_component(node, {
            sum: Number(base),
            click(){
                model.sum = model.sum + 1
            }
        }, {})
        // console.log('[debug]: node: ', node)
        return [model, node]
    }
})
