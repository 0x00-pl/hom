// normal form:
// [line]


function mk_node(name, exp){
    return {
        name,
        exp
    }
}

function exp_toString(exp){
    if(exp===undefined){ return 'undefined' }
    if(exp instanceof Array && (typeof(exp[0])=='string')){ return '('+exp.slice(1).map(exp_toString).join(exp[0])+')' }
    if(exp instanceof Array){ return '['+exp.map(exp_toString).join(', ')+']' }
    if(exp.name){ return exp.name }
    return exp+''
}

function exp_concat(prefix, p){
    if(prefix.length == 1){ return p }
    if(p.length == 1){ return prefix }
    if(p[0] == prefix[0] && prefix[0] == ''){
        return prefix.concat(p.slice(1))
    } else {
        if(prefix[0]==''){
            return prefix.concat([p])
        } else {
            return ['', prefix, ...p.slice(1)]
        }
    }
}


function exp_add_star(exp){
    if(exp.length == 1){
        return ['']
    } else if(exp.length == 2){
        return ['', exp[1], '*']
    } else {
        return ['', exp, '*']
    }
}


function fd_push(fd, k, v){
    let i = fd.findIndex((v)=>(v[0]==k))
    if(i == -1){
        fd.push([k, [v]])
    } else {
        fd[i][1].push(v)
    }
}

function deep_union(line_list){
    if(line_list.length == 1){ return line_list }
    let fd = []
    line_list.forEach(line=>{
        if(line.length<=1){ return }
        let last = line[line.length-1]
        let prefix = line.slice(0, line.length-1)
        fd_push(fd, last, prefix)
        // console.log('line: ', exp_toString(line), exp_toString(prefix))
        // console.log('line2: ', line.length, line, prefix, last)
    })

    let ret = []
    fd.forEach(([k, vl])=>{
        vl = deep_union(vl)
        // console.log('each: ', exp_toString(k), vl.length, vl.map(exp_toString).join(' '))
        let e1 = vl.length==0 ? ['+'] : vl.length==1 ? vl[0] : ['+'].concat(vl)
        let e2 = ['', k]
        // console.log('e1e2: ', e1, e2)
        // console.log('concat: ', exp_concat(e1, e2))
        ret.push(exp_concat(e1, e2))
    })
    return ret
}

function elimit_replace(line_list, a){
    let ret = []
    line_list.forEach(line=>{
        if(line[line.length-1] == a){
            let prefix = line.slice(0, line.length-1)
            let a_list = a.exp
            a_list.forEach(p=>{
                let l = exp_concat(prefix, p)
                ret.push(l)
            })
        } else {
            ret.push(line)
        }
    })
    // console.log('bufore union: ', ret.map(i=>i.length), exp_toString(ret))
    let ret1 = deep_union(ret)
    // console.log('after union: ', ret1.map(i=>i.length), exp_toString(ret1))
    return ret1
}

function elimit_rec(line_list, a){
    let post_list = []
    let star = []
    line_list.forEach(line=>{
        let last = line[line.length-1]
        if(last==a){
            star = line.slice(0, line.length-1)
            star = exp_add_star(star)
        } else {
            post_list.push(line)
        }
    })
    // console.log('star:', exp_toString(star), star, star==[])
    if(star.length == 0){
        return post_list
    } else if(post_list.length == 0){
        return [star]
    } else {
        return post_list.map(list=>{
            return exp_concat(star, list)
        })
    }
}

let debug = 0

function elimit_node(node_list, a){
    // replace all e in node_list
    node_list.forEach(n=>{
        if(debug>1) console.log('bef replace:', exp_toString(n.exp), a.name, exp_toString(a.exp))
        n.exp = elimit_replace(n.exp, a)
        if(debug>1) console.log('aft replace:', exp_toString(n.exp), a.name)
    })
}


function elimit(node_list){
    if(debug>0) node_list.forEach(n=>console.log(n.name, ': ', exp_toString(n.exp)))
    while(node_list.length > 1){
        let a = node_list.shift()
        a.exp = elimit_rec(a.exp, a)
        elimit_node(node_list, a)
        if(debug>0) console.log('---------', a.name, exp_toString(a.exp))
        if(debug>0) node_list.forEach(n=>console.log(n.name, ': ', exp_toString(n.exp)))
    }
    let r = node_list.shift()
    let exp = elimit_rec(r.exp, r)
    return exp[0]
}

function to_regex(n){
    let name_table = 'abcdefghijklmnopqrstuvwxyz'.split('')
    let nodes = Array.from({length: n}).fill(0).map((a,i)=>mk_node(name_table[i], []))
    nodes.forEach((node, i)=>{
        // node.exp = ['+', ['', 0, nodes[(i*2)%n]], ['', 1, nodes[(i*2+1)%n]]]
        node.exp = [['', 0, nodes[(i*2)%n]], ['', 1, nodes[(i*2+1)%n]]]
    })
    let str = exp_toString(elimit(nodes.reverse())).replace(/\((\d)\)/g, `$1`)
    let reg = '/^'+str.replace(/\+/g, '|')+'$/'
    return reg
}


console.log('let r3 = ', to_regex(3))
console.log('let r5 = ', to_regex(5))
console.log('let r7 = ', to_regex(7))
console.log('let r11 = ', to_regex(11))
console.log('let r13 = ', to_regex(13))
console.log('let r17 = ', to_regex(17))





