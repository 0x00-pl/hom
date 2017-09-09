
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
    if(p[0] == prefix[0]){
        return prefix.concat(p.slice(1))
    } else {
        return prefix.concat([p])
    }
}

function elimit_replace(exp, a){
    // console.log('e node: ', a.name, exp)
    let prefix_list = []
    if(exp[0] == '+'){
        prefix_list = exp.slice(1)
    } else {
        prefix_list = [exp]
    }
    let lines_list = prefix_list.map(prefix=>{

        // console.log('prefix: ', prefix )
        if(prefix[prefix.length-1] == a){
            // replace a
            let plus_list = a.exp[0]=='+' ? a.exp.slice(1) : [a.exp]
            return plus_list.map(plus=>exp_concat(prefix.slice(0, prefix.length-1), plus))
        } else {
            return [prefix]
        }
    })
    let lines = [].concat(...lines_list)
    return lines.length==1 ? lines[0] : ['+'].concat(lines)
}

function elimit_rec(exp, a){
    let lines = exp[0]=='+' ? exp.slice(1) : [exp]
    let [witha, withouta] = [[], []]
    lines.forEach(line=>{
        if(line[line.length-1] == a){
            witha.push(line.slice(0, line.length-1))
        } else {
            withouta.push(line)
        }
    })
    // console.log('with/out?', exp_toString(exp), witha.map(exp_toString), withouta.map(exp_toString))
    let r_list = []
    if(witha.length>0){
        let witha_exp = witha.length==1 ? witha[0] : ['+'].concat(witha)
        witha_exp = exp_concat(witha_exp.length==2 ? witha_exp : ['', witha_exp], '*')
        if(withouta.length>0){
            r_list = withouta.map(p=>exp_concat(witha_exp, p))
        } else {
            r_list = [witha_exp]
        }
    } else {
        r_list = withouta
    }
    return r_list.length==1 ? r_list[0] : ['+'].concat(r_list)
}



function elimit_node(node_list, a){
    // replace all e in node_list
    node_list.forEach(n=>{
        // console.log('bef replace:', exp_toString(n.exp), a.name, exp_toString(a.exp))
        n.exp = elimit_replace(n.exp, a)
        // console.log('aft replace:', exp_toString(n.exp), a.name)
    })
}




function elimit(node_list){
    // node_list.forEach(n=>console.log(n.name, ': ', exp_toString(n.exp)))
    while(node_list.length > 1){
        let a = node_list.shift()
        a.exp = elimit_rec(a.exp, a)
        elimit_node(node_list, a)
        // console.log('---------', a.name, exp_toString(a.exp))
        // node_list.forEach(n=>console.log(n.name, ': ', exp_toString(n.exp)))
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
console.log('let r3 = ', to_regex(3))
console.log('let r5 = ', to_regex(5))
console.log('let r7 = ', to_regex(7))
//console.log('let r11 = ', to_regex(11))
//console.log('let r13 = ', to_regex(13))
//console.log('let r17 = ', to_regex(17))





