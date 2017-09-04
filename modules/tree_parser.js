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

    function tagging_string(str_with_tag_list){
        let tokens = str_with_tag_list.map(block=>{
            if(block.tag != 'any'){ return block}
            let s = block.str
            let ret = []

            function find_str_end(str, base){
                while(true){
                    let p = str.indexof('"', base)
                    if(p == -1){
                        return -1
                    } else if(str[p-1] != '\\'){
                        return p
                    } else {
                        base = p + 1
                    }
                }
            }

            while(true){
                let str_beg = s.indexOf('"')
                if(str_beg == -1){
                    if(s != ''){ ret.push(str_with_tag('any', s)) }
                    break
                }
                if(str_beg != 0){
                    ret.push(str_with_tag('any', s.substr(0, str_beg)))
                }

                let str_end = find_str_end(s, str_beg)
                if(str_end == -1){
                    ret.push(str_with_tag('string', s.substr(str_beg)+'"'))
                    break
                } else {
                    ret.push(str_with_tag('string', s.substr(str_beg, str_end+1)))
                    s = s.substr(str_end+1)
                }
            }

            return ret
        })
        return [].concat(...tokens)
    }

    function tokens_to_ast(str_with_tag_list){
        let tokens = str_with_tag_list.reduce((acc,v)=>{
            if(v.tag != 'any') {
                acc.push(v)
                return acc
            } else {
                let tag = v.tag
                let seplited_1 = v.str.split(/(?=\(|\))/)
                let seplited = seplited_1.reduce((acc,s)=>{
                    if(s.startsWith('(') || s.startsWith(')')){
                        if(s.length > 1){
                            return acc.concat(str_with_tag('level-change', s[0]), str_with_tag(tag, s.substr(1)))
                        } else {
                            return acc.concat(str_with_tag('level-change', s))
                        }
                    } else {
                        return acc.concat(str_with_tag(tag, s))
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

    function split_tokens_with_space(tree){
        if(tree instanceof Array){
            return tree.reduce((acc,v)=>{
                if(v.tag == 'any'){
                    let block = v.str
                    let tokens = block.split(/[ \n\t\r]/).filter(t=>t!='').map(t=>str_with_tag('any', t))
                    return acc.concat(tokens)
                } else {
                    acc.push(v)
                    return acc
                }
            }, [])
        } else {
            return tree
        }
    }

    function show_tree(tree){
        if(tree instanceof Array){
            return ['(', ')'].join(tree.map(show_tree).join(' '))
        } else {
            return tree.toString()
        }
    }

    function tree_parse(str){
        let t1 = tagging_comment(str)
        let t2 = tagging_string(t1)
        let t3 = tokens_to_ast(t2)
        let t4 = split_tokens_with_space(t3)
        return t4
    }

    return { tree_parse, show_tree }
})
