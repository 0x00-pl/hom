
// normal form:
// (0a+1b)
// 01(01*)10(10(10)*a + 10(10)*b)
// 0(10)*10(1010)

function mk_node(name, exp){
    return {
        name,
        exp
    }
}

function exp_toString(exp){
    if(exp===undefined){ return 'undefined' }
    if(exp instanceof Array){ return '('+exp.slice(1).map(exp_toString).join(exp[0])+')' }
    if(exp.name){ return exp.name }
    return exp+''
}

function exp_concat(prefix, p){
    if(prefix.length == 1){ return p }
    if(p.length == 1){ return prefix }
    if(p[0] == prefix[0]){
        return prefix.concat(p.slice(1))
    } else {
        return prefix.concat([p])
    }
}

function exp_union(exp_list){
    if(exp_list.length == 0){
        return ['']
    } else if(exp_list.length == 1){
        return exp_list[0]
    } else {
        return ['+'].concat(exp_list)
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

function has_env(exp){
    return exp instanceof Array && exp[exp.length-1] instanceof Array &&
        exp[exp.length-1][exp[exp.length-1].length-1].name
}

function expand(exp){
    if(has_env(exp[exp.length-1])){
        let prefix = exp.slice(0, exp.length-1)
        let plus = exp[exp.length-1].slice(1)
        return plus.map(p=>exp_concat(prefix, p))
    } else {
        return [exp]
    }
}

function exp_split(prefix, r_list){
    if(r_list.length == 0){ return prefix }
    return r_list.map(r=>exp_concat(prefix, r))
}

function elimit_replace(exp, a){
    if(has_env(exp[exp.length-1])){
        let prefix = exp.slice(0, exp.length-1)
        let plus = exp[exp.length-1].slice(1)
        let witha = [], withouta = []
        plus.forEach(p=>{
            if(p[p.length-1] == a){
                let new_p = p.slice(0, p.length-1)
                witha.push(new_p)
            } else {
                withouta.push(p)
            }
        })
        let p1 = exp_union(witha)
        let aexp_list = expand(a.exp)
        let pa_list = exp_split(p1, aexp_list)
        let new_plus = exp_union(withouta.concat(pa_list))
        return exp_concat(prefix, new_plus)
    } else if(has_env(exp)){
        let plus = exp.slice(1)
        let witha = [], withouta = []
        plus.forEach(p=>{
            if(p[p.length-1] == a){
                let new_p = p.slice(0, p.length-1)
                witha.push(new_p)
            } else {
                withouta.push(p)
            }
        })
        let p1 = exp_union(witha)
        let aexp_list = expand(a.exp)
        let pa_list = exp_split(p1, aexp_list)
        return exp_union(withouta.concat(pa_list))
    } else {
        return exp
    }
}

function elimit_rec(exp, a){
    if(has_env(exp[exp.length-1])){
        let prefix = exp.slice(0, exp.length-1)
        let plus = exp[exp.length-1].slice(1)
        let witha = [], withouta = []
        plus.forEach(p=>{
            if(p[p.length-1] == a){
                let new_p = p.slice(0, p.length-1)
                witha.push(new_p)
            } else {
                withouta.push(p)
            }
        })
        let all1 = exp_concat(prefix, exp_union(witha))
        let all2 = exp_concat(prefix, exp_union(withouta))
        let all = exp_concat(exp_add_star(all1), all2)
        return all
    } else if(has_env(exp)){
        let plus = exp.slice(1)
        let witha = []
        let withouta = []
        plus.forEach(p=>{
            if(p[p.length-1] == a){
                let new_p = p.slice(0, p.length-1)
                witha.push(new_p)
            } else {
                withouta.push(p)
            }
        })
        let all1 = exp_union(witha)
        // console.log('with/out: ', witha, withouta)
        let all2 = exp_union(withouta)
        console.log('all: ',  all1, exp_add_star(all1))
        let all = exp_concat(exp_add_star(all1), all2)
        return all
    } else {
        return exp
    }
}


// function elimit_replace(exp, a){
//     // console.log('e node: ', a.name, exp)
//     let prefix_list = []
//     if(exp[0] == '+'){
//         prefix_list = exp.slice(1)
//     } else {
//         prefix_list = [exp]
//     }
//     let lines_list = prefix_list.map(prefix=>{

//         // console.log('prefix: ', prefix )
//         if(prefix[prefix.length-1] == a){
//             // replace a
//             let plus_list = a.exp[0]=='+' ? a.exp.slice(1) : [a.exp]
//             return plus_list.map(plus=>exp_concat(prefix.slice(0, prefix.length-1), plus))
//         } else {
//             return [prefix]
//         }
//     })
//     let lines = [].concat(...lines_list)
//     return lines.length==1 ? lines[0] : ['+'].concat(lines)
// }

// function elimit_replace(exp, a){
//     if(exp.name) { return exp }
//     if(exp instanceof String) { return exp }
//     let ret = []
//     exp.forEach(e=>{
//         e = elimit_replace(e, a)
//         if(e instanceof Array && e[0]==exp[0]){
//             ret = ret.concat(e.slice(1))
//         } else {
//             ret.push(e)
//         }
//     })
//     return ret
// }


// function elimit_rec(exp, a){
//     let lines = exp[0]=='+' ? exp.slice(1) : [exp]
//     let [witha, withouta] = [[], []]
//     lines.forEach(line=>{
//         if(line[line.length-1] == a){
//             witha.push(line.slice(0, line.length-1))
//         } else {
//             withouta.push(line)
//         }
//     })
//     // console.log('with/out?', exp_toString(exp), witha.map(exp_toString), withouta.map(exp_toString))
//     let r_list = []
//     if(witha.length>0){
//         let witha_exp = witha.length==1 ? witha[0] : ['+'].concat(witha)
//         witha_exp = exp_concat(witha_exp.length==2 ? witha_exp : ['', witha_exp], '*')
//         if(withouta.length>0){
//             r_list = withouta.map(p=>exp_concat(witha_exp, p))
//         } else {
//             r_list = [witha_exp]
//         }
//     } else {
//         r_list = withouta
//     }
//     return r_list.length==1 ? r_list[0] : ['+'].concat(r_list)
// }

let debug = 1

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
    return exp
}

function to_regex(n){
    let name_table = 'abcdefghijklmnopqrstuvwxyz'.split('')
    let nodes = Array.from({length: n}).fill(0).map((a,i)=>mk_node(name_table[i], []))
    nodes.forEach((node, i)=>{
        node.exp = ['+', ['', 0, nodes[(i*2)%n]], ['', 1, nodes[(i*2+1)%n]]]
    })
    let str = exp_toString(elimit(nodes.reverse()))
    let reg = '/^'+str.replace(/\+/g, '|')+'$/'
    return reg
}

// let a = mk_node('a', [])
// let b = mk_node('b', [])
// let c = mk_node('c', [])
// a.exp = ['+', ['', 0, a], ['', 1, b]]
// b.exp = ['+', ['', 0, c], ['', 1, a]]
// c.exp = ['+', ['', 0, b], ['', 1, c]]
// // b.exp = ['+', ['', ['', 0,1,'*',0,1], '*', 0,1,'*',0,0, b], ['', ['', 0,1,'*',0,1],'*',1,a]]

// console.log(exp_toString(elimit([c, b, a])))
//console.log('let r3 = ', to_regex(3))
console.log('let r5 = ', to_regex(5))
//console.log('let r7 = ', to_regex(7))
//console.log('let r11 = ', to_regex(11))
//console.log('let r13 = ', to_regex(13))
//console.log('let r17 = ', to_regex(17))





