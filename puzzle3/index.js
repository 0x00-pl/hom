

function copy_map(m){
    return m.map(l=>l.map(v=>v))
}

function lx(x, r){
    let l = r ? [6,5,4,3,2,1] : [0,1,2,3,4,5,6]
    return l.map(y=>[x,y])
}
function ly(y, r){
    let l = r ? [6,5,4,3,2,1] : [0,1,2,3,4,5,6]
    return l.map(x=>[x,y])
}
let pos_dict = [].concat(
    [0,1,2,3,4,5,6].map(y=>ly(y,false)),
    [0,1,2,3,4,5,6].map(x=>lx(x,true)),
    [6,5,4,3,2,1,0].map(y=>ly(y,true)),
    [6,5,4,3,2,1,0].map(x=>lx(x,false))
)

function idx_to_pos(idx){
    return pos_dict(idx)
}

function get_lr(arr){
    let rl = arr.reduce((acc,v,i,l)=>{
        if(i == 0){ return [1, v] }
        if(v > acc[1]){ return [acc[0]+1, v] }
        return acc
    }, [0, -1])
    let rr = arr.reduceRight((acc,v,i,l)=>{
        if(i == 6){ return [1, v] }
        if(v > acc[1]){ return [acc[0]+1, v] }
        return acc
    }, [0, -1])
    return [rl[0], rr[0]]
}
// console.log(get_lr([6,1,2,3,4,7,5]))
// exit


let permute_dict = new Array(8).fill(0).map(i=>new Array(8).fill(0).map(j=>new Array()))
let usedChars = [];
function permute(input) {
    let i, ch;
    for (i = 0; i < input.length; i++) {
        ch = input.splice(i, 1)[0];
        usedChars.push(ch);
        if (input.length == 0) {
            let line = usedChars.slice()
            let [l, r] = get_lr(line)
            permute_dict[l][r].push(line)
            permute_dict[0][r].push(line)
            permute_dict[l][0].push(line)
            permute_dict[0][0].push(line)
        }
        permute(input);
        input.splice(i, 0, ch);
        usedChars.pop();
    }
}
permute([0,1,2,3,4,5,6])
// console.log(permute_dict.map(l=>l.map(e=>('   '+e.length).slice(-4))))

let dist_line_cache = [
    [1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0],
    [0,0,0,0,0,1,0],
    [0,0,0,0,0,0,1]
]
let dist_line_cache2 = new Array(7).fill(0).map(a=>new Array(7).fill(0.142))
function dist_line(line){
    if(line.length == 1){
        return line[0].map(v=>dist_line_cache[v])
    }
    if(line.length > 30 ){
        return dist_line_cache2
    }
    let ret_line = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
    ]
    line.forEach(l=>{
        // console.log(ret_line)
        l.forEach((e,i)=>{
            ret_line[i][e]++
        })
    })
    // normalize
    ret_line.forEach(v=>{
        v.forEach((n,i)=>{
            v[i] = v[i] / line.length
        })
    })
    return ret_line
}

function dist_m(views7){
    return views7.map(dist_line)
}
// let line_ex = [[0,1,2,3,4,5,6],[0,1,2,3,4,6,5]]
// console.log('dist m: ', dist_m([line_ex,line_ex,line_ex,line_ex,line_ex,line_ex,line_ex]))
// exit

function merge_dist_dict_max(d1, d2, disabled_set){
    let ret = [-1, -1] // [prob, num]
    d1.forEach((v,i)=>{
        if(d1[i]!=0 && d2[i]!=0 && !(disabled_set && disabled_set.has(i))){
            let prob = d1[i] + d2[i]
            if(prob > ret[0]){
                ret = [prob, i]
            }
        }
    })
    return ret
}

// console.log(merge_dist_dict_max( { '5': 0.5, '6': 0.3 },
//                                  { '5': 0.4, '6': 0.5 } ))
// exit

// return prob of map :: map2d<dict<num,prob>>
function dist_max(m, views, disabled_set_dict){
    let y7 = views.slice(0, 7)
    let x7 = views.slice(7, 14)
    let dist_x = dist_m(x7)
    let dist_y = dist_m(y7)

    let max_ = [[-1, -1], -2] // [pos, num]
    let prob = -1
    for(let i=0; i<7; i++){
        for(let j=0; j<7; j++){
            if(m[i][j] == -1){
                let [prob_c, n] = merge_dist_dict_max(dist_x[i][j], dist_y[j][i], disabled_set_dict[i*10+j])
                //if(i==2 && j==5 && n==2) console.log('dist:  ', dist_x[i][j], dist_y[j][i], prob_c, n, i,j, x7.map(a=>a.length), y7.map(a=>a.length))
                if(prob_c == -1){ return [[i,j], -1] }
                if(prob_c > prob){
                    prob = prob_c
                    max_ = [[i, j], n]
                }
            }
        }
    }
    return max_
}

let line_not_memory = new Array(7).fill(0).map(a=>[])
let line_not_memory_data = new Array(7).fill(0).map(a=>[])

function line_set_n(line, i, n){
    return line.filter(l=>l[i]==n)
}
function line_not_n(line, i, n){
    if(line.length > 700){
        let ci = line_not_memory[n].indexOf(line)
        if(ci != -1){
            return line_not_memory_data[n][ci]
        }
        let ret = line.filter(l=>l[i]!=n)
        line_not_memory[n].push(line)
        line_not_memory_data[n].push(ret)
        return ret
    } else {
        return line.filter(l=>l[i]!=n)
    }
}
function views_set_n(views, i, j, n){
    let y7 = views.slice(0, 7)
    let x7 = views.slice(7, 14)
    x7[i] = line_set_n(x7[i], j, n)
    y7[j] = line_set_n(y7[j], i, n)
    return [...y7, ...x7]
}
function views_not_n(views, i, j, n){
    let y7 = views.slice(0, 7)
    let x7 = views.slice(7, 14)
    x7[i] = line_not_n(x7[i], j, n)
    if(x7[i].length==0){ return null }
    y7[j] = line_not_n(y7[j], i, n)
    if(y7[j].length==0){ return null }
    return [...y7, ...x7]
}

function step(m, views, depth){
    let disabled_set_dict = []
    while(true){
        // find max prob
        let [[x,y], n] = dist_max(m, views, disabled_set_dict)
        if(n == -2){ return m }
        if(n == -1){
            // console.log('step empty set: ', x, y);show_map(m)
            return null
        }
        // assign
        // update views and map
        m[x][y] = n
        let views_next = views_set_n(views, x, y, n)
        // if(depth<=13){
        //     console.log(depth, x, y, n, views_next.map(l=>l.length))
        //     show_map(m_next)
        // }
        let ret = step(m, views_next, depth+1)
        if(ret){
            return ret
        }
        m[x][y] = -1
        // update views_set
        views = views_not_n(views, x, y, n)
        disabled_set_dict[x*10+y] = (disabled_set_dict[x*10+y] || new Set()).add(n)
        if(views == null) {
            // console.log('step no more: ', x, y, n); show_map(m);
            return null
        }
    }
}




function solvePuzzle(clues) {
    let views = [
        permute_dict[clues[0]][clues[20]],
        permute_dict[clues[1]][clues[19]],
        permute_dict[clues[2]][clues[18]],
        permute_dict[clues[3]][clues[17]],
        permute_dict[clues[4]][clues[16]],
        permute_dict[clues[5]][clues[15]],
        permute_dict[clues[6]][clues[14]],
        permute_dict[clues[27]][clues[7]],
        permute_dict[clues[26]][clues[8]],
        permute_dict[clues[25]][clues[9]],
        permute_dict[clues[24]][clues[10]],
        permute_dict[clues[23]][clues[11]],
        permute_dict[clues[22]][clues[12]],
        permute_dict[clues[21]][clues[13]],
    ]
    let m = new Array(7).fill(-1).map(a=>new Array(7).fill(-1))
    let r = step(m, views, 0)
    r = r.map(l=>l.map(n=>n+1))
    show_map(r)
    return r
}

// solvePuzzle([7,6,5,4,3,2,1, 1,2,2,2,2,2,2, 2,2,2,2,2,2,1, 1,2,3,4,5,6,7])
// solvePuzzle([7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4])
solvePuzzle([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1])
//solvePuzzle([0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0])


function show_map(m){
    console.log('------')
    m.forEach(line=>{
        line = line.map(n=>n==-1 ? ' ' : ''+n)
        console.log(...line)
    })
    console.log('------')
}
