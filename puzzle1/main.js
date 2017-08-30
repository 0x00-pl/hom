define(['tools', 'document', 'dom-builder', 'dataset'], (tools, document, dom_builder, dataset)=>{
    let {dom, remove_all_child, reattach} = dom_builder

    function color_box(c, dig){
        let r = 200 - Math.max(0, -c) * 150 | 0
        let b = 200 - Math.max(0, c) * 150 | 0
        let g = Math.min(r,b)
        return ['div', {
            class:'color-box '+(dig?'color-box-dig':''),
            style:`background-color: rgb(${r},${g},${b})`,
            title:(c*100)|0
        }]
    }

    function all_box(mat){
        return [
            'div', {class:'color-tab'},
            mat.map((line,i)=>[
                'div', {class:'color-line'},
                line.map((c,j)=>{ return color_box(c, i==j) })
            ])
        ]
    }

    function box_dom(box_mat){
        return dom(...box_mat)
    }

    function data_relation(xy_list, [x_width, y_width], f){
        f = f || (n=>n)
        // normalize to 1 and -1
        let zeros = new Array(Math.max(x_width, y_width)).fill(0)
        let mat = new Array(x_width).fill(0).map(()=>new Array(y_width).fill(0))
        xy_list.forEach(([x, y])=>{
            y = f(y)
            let x_list = (zeros.concat(Array.from(Number(x).toString(2)))).map(n=>(n*2-1)).slice(-x_width)
            let y_list = (zeros.concat(Array.from(Number(y).toString(2)))).map(n=>(n*2-1)).slice(-y_width)
            // console.log('mat00', mat[0][0], x_list.length, y_list.length)
            x_list.forEach((xi,i)=>y_list.forEach((yj,j)=> {mat[i][j]+=xi*yj} ))
            // console.log(x_list[0], y_list[0], x_list[0]*y_list[0], mat[0][0])
        })
        let mat_avg = mat.map(line=>line.map(n=>n/xy_list.length))
        // console.log(mat, mat_avg)
        return mat_avg
    }

    function bit_relation(xy_list, [x_width, y_width], idx, pos_neg, f, rel){
        let v = pos_neg ? 1 : -1
        let zeros = new Array(Math.max(x_width, y_width)).fill(0)
        let mat = new Array(y_width).fill(0).map(()=>new Array(y_width).fill(0))
        let count = 0
        xy_list.forEach(([x, y])=>{
            let fy = f(y)
            let x_list = (zeros.concat(Array.from(Number(x).toString(2)))).map(n=>(n*2-1)).slice(-x_width)
            let t = x_list[(x_width+idx)%x_width]
            if(t==v){
                count += 1
                let y_list = (zeros.concat(Array.from(Number(y).toString(2)))).map(n=>(n*2-1)).slice(-y_width)
                let fy_list = (zeros.concat(Array.from(Number(fy).toString(2)))).map(n=>(n*2-1)).slice(-y_width)
                y_list.forEach((yi,i)=>fy_list.forEach((yj,j)=> {mat[i][j]+=rel(yi,yj)}))
                console.log(Number(y).toString(2))
                console.log(Number(fy).toString(2))
                console.log(('00000000'+Number(y^fy).toString(2)).slice(-8))

            }
        })
        let mat_avg = mat.map(line=>line.map(n=>n/count))
        // console.log(mat, mat_avg)
        return mat_avg
    }
    function bit_xor(a,b){return -a*b}
    function bit_and(a,b){return a+b>1 ? 1 : -1}
    function bit_or(a,b){return a+b>-1 ? 1 : -1}


    function render_box(target_class, mat){
        let target = document.getElementsByClassName(target_class)[0]
        let payload = box_dom(all_box(mat))
        reattach(target, payload)
    }

    function f1(n){
        n = Number(n)-3
        return n
    }
    function f2(n){
        return n
    }
    function fid(n){return n}
    function fbit(n){return n-3}

    return ()=>{
        console.log(JSON.stringify(dataset.slice(0,10)))
        console.log(JSON.stringify(dataset.slice(0,10).map(line=>line.map(n=>Number(n).toString(2)))))

        render_box('relation_graph1', data_relation(dataset.slice(3,256), [25,25]))
        render_box('relation_graph2', data_relation(dataset.slice(256, 1024), [25,25]))

        render_box('relation_graph1t', data_relation(dataset.slice(3, 256), [25,25], f1))
        // console.log(JSON.stringify(dataset.slice(0,10).map(line=>line.map(n=>f1(Number(n)).toString(2)))))
        render_box('relation_graph2t', data_relation(dataset.slice(256, 1024), [25,25], f2))

        render_box('relation_pos', bit_relation(dataset.slice(3,256), [25,25], -4, true, fbit, bit_xor))
        render_box('relation_neg', bit_relation(dataset.slice(3,256), [25,25], -4, false, fbit, bit_xor))
    }
})
