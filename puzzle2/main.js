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

// function split_01(exp){
//     if(!(exp instanceof Array)){ return exp }
//     if(exp[0] == '+'){
//     } else {

//         return []
//     }
// }
// function merge_o1(splited){
//     let [z, a] = splited
//     let z_exp = exp_concat(['', 0], merge_o1(z))
//     let a_exp = exp_concat(['', 1], merge_o1(a))
//     return exp_union([z_exp, a_exp])
// }

// function exp_union(exp_list){
//     exp_list = exp_list.filter(e=>{
//         if(e instanceof Array && e.length==1){
//             return false
//         } else {
//             return true
//         }
//     })

//     if(exp_list.length == 0){
//         return ['']
//     } else if(exp_list.length == 1){
//         return exp_list[0]
//     } else {
//         return ['+'].concat(exp_list)
//     }
// }

function exp_add_star(exp){
    if(exp.length == 1){
        return ['']
    } else if(exp.length == 2){
        return ['', exp[1], '*']
    } else {
        return ['', exp, '*']
    }
}

function exp_group(exp_list, a){
    let witha = [], withouta = []
    exp_list.forEach(p=>{
        if(p[p.length-1] == a){
            let new_p = p.slice(0, p.length-1)
            witha.push(new_p)
        } else {
            withouta.push(p)
        }
    })
    return [witha, withouta]
}

function expand_all(exp){
    if(!(exp instanceof Array)){ return exp }
    let ret = []
    if(exp[0] == '+'){
        exp.slice(1).forEach(e=>{
            let es =  expand_all(e)
            ret = ret.concat(es)
        })
    } else {
        let prefix = exp.slice(0, exp.length-1)
        let last = exp[exp.length-1]
        let es = expand_all(last)
        es.forEach(e=>{
            let line = exp_concat(prefix, e)
            ret.push(line)
        })
    }
    return ret
}

function array_all(list, f){
    for(let i of list){
        if(!f(i)){ return false }
    }
    return true
}

function lines_pop_suffix(line_list){
    let suffix_rev = []
    while(true){
        let last = line_list[0][line_list[0].length-1]
        let same = array_all(line_list, (line)=>{
            return line[line.length-1] == last
        })
        if(!same){ break }
        suffix_rev.push(last)
        line_list = line_list.map((line)=>line.slice(0, line.length-1))
    }
    return [line_list, suffix_rev.reverse()]
}


function line_union(line_list){
    line_list = line_list.filter(e=>(!(e instanceof Array && e.length==1)))

    if(line_list.length == 0){
        return ['+']
    } else if(line_list.length == 1){
        return line_list[0]
    } else {
        let [diff, suffix] = lines_pop_suffix(line_list)
        let diff_exp = diff.length==0 ? ['+'] : diff.length==1 ? diff[0] : ['+'].concat(diff)
        return exp_concat(diff_exp, [''].concat(suffix))
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

// function elimit_replace(exp, a){
//     if(!(exp instanceof Array)){ return exp }
//     if(exp[0] == '+'){
//         // group by if endsWith a
//         let [witha, withouta] = exp_group(exp.slice(1), a)
//         // console.log('with?: ', witha, withouta)
//         // replace each without a
//         withouta = withouta.map(e=>elimit_replace(e, a))
//         // replace a, rebuild up
//         let witha_exp = exp_union(witha)
//         let endsa = witha_exp.length==1 ? ['+'] : exp_concat(witha_exp, a.exp)
//         let each = endsa[0]=='+' ? endsa.slice(1) : [endsa]
//         // console.log('ob1c: ', each, withouta)
//         return exp_union([].concat(each, withouta))
//     } else {
//         // replace each
//         let each = exp.slice(1).map(e=>elimit_replace(e, a))
//         // concat each
//         return [''].concat(each)
//     }
// }

// function pop_relatate(exp, a){
//     if(!(exp instanceof Array)){ return exp==a ? [[['']], ['']] : [[], exp] }
//     if(exp[0] == '+'){
//         // pop relate each
//         let r_list = exp.slice(1).map(e=>pop_relatate(e, a))
//         // merge all
//         let rela_list = []
//         let other_list = []
//         r_list.map(([r,o])=>{
//             rela_list = rela_list.concat(r)
//             other_list.push(o)
//         })
//         return [rela_list, exp_union(other_list)]
//     } else {
//         // split prefix and last
//         let prefix = exp.slice(0, exp.length-1)
//         let last = exp[exp.length-1]
//         // last pop_relatate
//         let [rela_list, other] = pop_relatate(last, a)
//         // concat prefix and union(last_relatate)
//         let r = rela_list.length==0 ? [] : [exp_concat(prefix, exp_union(rela_list))]
//         let o = other.length<=1 ? [''] : exp_concat(prefix, other)
//         // return
//         return [r, o]
//     }
// }

// function elimit_rec(exp, a){
//     // pop all endsWith a
//     let [r, o] = pop_relatate(exp, a)
//     // rebuild up
//     let prefix_star = exp_add_star(exp_union(r))
//     return exp_concat(prefix_star, o)
// }



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





