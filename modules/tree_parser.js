define([], ()=>{
    function str_with_tag(tag, str){
        let ret = Object.create(String.prototype)
        function toString(){ return this.str }
        function valueOf(){ return this.str }
        return Object.assign(ret, { tag, str, toString, valueOf })
    }

    function tagging_comment(str){
        let comment_re = (/(?=\(\*|\*\))/)
        let tokens = str.split(comment_re)
        let ret = []
        tokens.reduce(([buffer, level], v)=>{
            if(v.startsWith('(*')){
                level++
                buffer.push(v)
            } else if(v.startsWith('*)')){
                level--
                if(level == 0){
                    buffer.push('*)')
                    ret.push(str_with_tag('comment',  buffer.join('')))
                    if(v.length > 2){
                        ret.push(str_with_tag('any', v.substr(2)))
                    }
                    buffer = []
                }else{
                    buffer.push(v)
                }
            } else {
                ret.push(str_with_tag('any', v))
            }
            return [buffer, level]
        }, [[], 0])

        return ret
    }

    function tree_parse(str_with_tag_list){
        let tokens = str_with_tag.reduce((acc,v)=>{
            if(v.tag != 'any') {
                return acc.concat(v)
            } else {
                let tag = v.tag
                let seplited_1 = v.str.split(/(?=\(|\))/)
                let seplited = seplited_1.reduce((acc,v)=>{
                    if(v.startsWith('(') || v.startsWith(')')){
                        return acc.concat(str_with_tag('level-change', v[0]), str_with_tag(tag, v.substr(1)))
                    } else {
                        return acc.concat(str_with_tag(v))
                    }
                }, [])
                return acc.concat(seplited)
            }
        }, [])

        function make_ast(tokens){
            let ret_reverse = []
            while(true){
                let last = tokens.pop()
                if(last == undefined || last == '('){
                    break
                }if(last == ')'){
                    ret_reverse.push(make_ast(tokens))
                } else {
                    ret_reverse.push(last)
                }
            }
            return ret_reverse.reverse()
        }

        return make_ast(tokens)
    }
})
