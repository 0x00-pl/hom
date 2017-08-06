define([], ()=>{
    function object_map(obj, fvko){
        let keys = Object.keys(obj)
        return keys.reduce((r,name)=>{
            r[name] = fvko(obj[name], name, obj)
            return r
        }, {})
    }

    return {
        object_map
    }
})
