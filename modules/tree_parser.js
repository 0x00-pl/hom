define([], ()=>{
    let comment_beg1 = '/*'
    let comment_end1 = '*/'
    let comment_beg2 = '//'
    let comment_end2 = '\n'
    let sub_tree_beg_end = []
    let seps = []
    function shift_str(str, _end){
        let p = str.indexOf(_end)
        return [str.substring(0, p), str.substring(p)]
    }

    function tree_parse(str, commonts){
        
    }
})
