define([], ()=>{
    function str_with_tag(tag, str){
        let ret = Object.create(String.prototype)
        function toString(){ return this.str }
        return Object.assign(ret, { tag, str, toString })
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



    function tree_parse(str, commonts){
        
    }
})
