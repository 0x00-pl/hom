

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
        if(i == 0){ return 1 }
        if(v > l[i-1]){ return acc+1 }
        return acc
    }, 0)
    let rr = arr.reduce((acc,v,i,l)=>{
        if(i == 0){ return 1 }
        if(v > l[i-1]){ return acc+1 }
        return acc
    }, 0)
    return [rl, rr]
}

let permute_dict = new Array(8).fill(0).map(i=>new Array(8).fill(0).map(j=>new Set()))
let usedChars = [];
function permute(input) {
    let i, ch;
    for (i = 0; i < input.length; i++) {
        ch = input.splice(i, 1)[0];
        usedChars.push(ch);
        if (input.length == 0) {
            let line = usedChars.slice()
            let [l, r] = get_lr(line)
            permute_dict[l][r].add(line)
            permute_dict[8][r].add(line)
            permute_dict[l][8].add(line)
        }
        permute(input);
        input.splice(i, 0, ch);
        usedChars.pop();
    }
    return permArr
}
permute([0,1,2,3,4,5,6])


function views_to_builds(l, r){
    return permute_dict[l][r]
}

function match(base, p){
    for(let i=0; i<7; i++){
        if(base[i] != -1){
            if(base[i] != p[i]){
                return false
            }
        }
    }
    return true
}

function prob(idx, pool){
    let sumr = new Array(7).fill(0).map(x=>new Array(7).fill(0))
    pool.forEach(l=>{
        l.forEach((n,i)=>{
            sumr[i][n]++
        })
    })
    return sumr.map(n=>n/pool.length)
}

function prob_m(l){
    let 
}
