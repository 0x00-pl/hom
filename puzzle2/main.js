


function mk_exp(n, s){
    return n.concat(s)
}

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

function elimit_node_in_exp(exp, e){
    // ['', 1, a] a  ==> ['', 1, a.exp]
    return exp.map(p=>{
        if(p instanceof Array){
            return elimit_node_in_exp(p, e)
        } else {
            return p===e ? e.exp : p
        }
    })
}

function pop_node(exp, a){
    if(exp[0] == ''){
        // ['' c [...d] [+ [...e] f A]] ==> [+ ['' c [...d] [...e]] ['' c [...d] f] ['' c [...d] A]]
        if(exp[exp.length-1] instanceof Array && exp[exp.length-1][0]=='+'){
            let prefix = exp.slice(1, exp.length-1)
            let plus = exp[exp.length-1]
            //plus = pop_node(plus, a)
            //if(plus.findIndex(exp=>exp[exp.length-1]==a) == -1){ return exp } // no reltate to A
            // console.log('debug: prefix, plus: ', exp_toString(['+'].concat(prefix)), exp_toString(plus))
            let r = plus.slice(1).map(p=>{
                if(p[0]!='')console.log('should be true: ', p[0]=='', p, exp_toString(plus), exp_toString(exp))
                return [''].concat(prefix, p.slice(1))
            })
            // console.log('debug: r: ', r)
            return ['+'].concat(r)
        } else {
            return exp
        }
    } else if(exp[0]=='+'){
        // merge +
        // [+ b [+ c A]] ==> [+ b c A]
        return exp.slice(1).reduce((acc,v)=>{
            v = pop_node(v, a)
            if(v instanceof Array && v[0]==['+']){
                return acc.concat(v.slice(1))
            } else {
                return acc.concat([v])
            }
        }, ['+'])
    } else {
        console.log('[debug]pop_node')
        return exp
    }
}

function elimit_rec(exp, a){
    // console.log('[exp1', a.name, ']: ', exp)
    exp = pop_node(exp, a)
    // console.log('[exp2', a.name, ']: ', exp)
    if(exp[0]==''){
        if(exp[exp.length-1]==a){
            // ['' b a] ==> ['' ['' b] *]
            return ['', exp.slice(0,exp.length-1), '*']
        } else {
            return exp
        }
    } else if(exp[0]=='+'){
        // merge  [+ ['' b a] ['' c a] d e] ==> [+ ['' b] ['' c]] * [+ d e]
        let [witha, withouta] = exp.slice(1).reduce((acc,v)=>{
            // console.log('v: ', exp_toString(v), v[v.length-1].name)
            if(v[v.length-1]==a){
                let opt = v.slice(0, v.length-1)
                if(opt.length == 2){
                    // ['' b] ==> b
                    opt = opt[1]
                }
                acc[0].push(opt)
            } else {
                acc[1].push(v)
            }
            return acc
        }, [[],[]])
        // console.log('with/out?', exp_toString(exp), witha.map(exp_toString), withouta.map(exp_toString))
        if(witha.length == 0){
            return withouta.length>1 ? ['+'].concat(withouta) : withouta[0]
        }
        if(withouta.length == 0){
            return witha.length>1 ? ['', ['+'].concat(witha), '*'] : ['', witha[0], '*']
        }

        let withas = witha.length>1 ? ['+'].concat(witha) : witha[0]
        let ret_list = withouta.map(e=>{
            if(withas instanceof Array){
                if(withas[0]==e[0]){
                    return withas.concat(e.slice(1))
                } else {
                    return withas.concat([e])
                }
            } else {
                return ['', withas, ...(e[0]=='' ? e.slice(1) : [e])]
            }
        })
        if(ret_list.length == 1){
            return ret_list[0]
        } else {
            return ['+'].concat(ret_list)
        }

        // let withoutas = withouta.length>1 ? [['+'].concat(withouta)] : withouta
        // console.log('debug: withas: ', withas, [''].concat(withas, '*', ...withoutas))
        //return [''].concat([withas], '*', ...withoutas)
    } else {
        console.log('[debug]elimit_rec: ', exp, a)
        return exp
    }
}

function split_plus_element(prefix_list, ele){
    return [''].concat(prefix_list, [ele])
}
function split_plus(prefix_list, plus){
    if(plus.length == 2){ return split_plus_element(prefix_list, plus[1]) }
    return ['+'].concat(plus.slice(1).map(p=>{
        [''].concat(prefix_list, p.slice(1))
    }))
}

function elimit_replace(exp, a){
    // b(c(a 1))
    if(exp instanceof Array){
        let last = exp[exp.length-1]
        // last = elimit_replace(last, a)
        if(last instanceof Array){
            if(exp[0] == last[0]){
                return exp.slice(0, exp.length-1).concat(last.slice(1))
            } else if (exp[0]=='' && last[0]=='+'){
                let prefix = exp.slice(1, exp.length-1)
                return split_plus(prefix, last)
            } else {
                return exp.slice(0, exp.length-1).concat([last])
            }
        } else {
            return exp.slice(0, exp.length-1).concat([last])
        }


        // return exp.slice(1).reduce((acc, v)=>{
        //     if(v[v.length-1]==a){
        //         if(v[0] == exp[0]){
        //             v = elimit_replace(v, a)
        //             return acc.concat(v.slice(1))
        //         } else if(exp[0]=='' && v[0]=='+'){
        //             return pop_node(v a)
        //         }
        //     } else {
        //         v = elimit_replace(v, a)
        //         return acc.concat([v])
        //     }
        // }, [exp[0]])
    } else if(exp.name){
        return exp==a? a.exp : exp
    } else {
        return exp
    }
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
    node_list.forEach(n=>console.log(n.name, ': ', exp_toString(n.exp)))
    while(node_list.length > 1){
        let a = node_list.shift()
        a.exp = elimit_rec(a.exp, a)
        elimit_node(node_list, a)
        console.log('---------', a.name, exp_toString(a.exp))
        node_list.forEach(n=>console.log(n.name, ': ', exp_toString(n.exp)))
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
    let reg = '/^'+str.replace('+', '|')+'$/'
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
console.log(to_regex(5))





