
define = function (){
    let cache = {}

    function load_script(name, url, cb, error_cb){
        let body = document.getElementsByTagName('head')[0]
        let script = document.createElement('script')
        script.addEventListener('defined', cb)
        script.addEventListener('error', error_cb)
        script.setAttribute('type', 'text/javascript')
        script.setAttribute('charset', 'utf-8')
        script.setAttribute('async', '')
        script.setAttribute('module-name', name)
        script.setAttribute('src', url)
        body.appendChild(script)
        return script
    }
    function cancle_script(name){
        let body = document.getElementsByTagName('head')[0]
        let scripts = body.getElementsByTagName('script')
        Array.filter(scripts, t=>t.getAttribute('module-name')===name).forEach(t=>body.removeChild(t))
    }

    function resolve_single(name, lib_path, timeout){
        if(cache[name] !== undefined){ return name }
        timeout = timeout || 10000
        let url = lib_path + name + '.js'
        let time_handler = null

        let timer = new Promise((resolve,reject)=>{
            time_handler = setTimeout(timeout, ()=>{console.log('timeout'); cancle_script(name); reject('timeout') })
        })
        let loader = new Promise((resolve,reject)=>{
            load_script(
                name, url,
                (ev)=>{
                    clearTimeout(time_handler)
                    resolve(name)
                },
                (ev)=>{
                    reject('load script error')
                }
            )
        })

        return Promise.race([timer, loader])
    }

    function resolve_single_backup(name, lib_path_list, timeout){
        lib_path_list = lib_path_list || ['']
        lib_path_list = lib_path_list.length===0 ? [''] : lib_path_list
        let timeout_each = timeout / lib_path_list.length
        let lib_path_list_cp = lib_path_list.slice()
        let ret = resolve_single(name, lib_path_list_cp.shift(), timeout_each)
        lib_path_list_cp.forEach(lib_path=>{
            ret=Promise.resolve(ret).catch(err=>resolve_single(name, lib_path, timeout_each))
        })
        return ret
    }

    function define(req, cb){
        cb = cb || (x=>x)
        let self_dom = document.currentScript
        let self_name = self_dom.getAttribute('module-name')
        let current_path = self_dom.getAttribute('src') || ''
        let current_dir = current_path.substr(0, current_path.lastIndexOf('/')+1)
        let loader_list = req.map(name=>resolve_single_backup(name, Array.concat([current_dir, ''], define.lib_path), 5000))

        return Promise.all(loader_list).then(name_list => {
            let module_list = name_list.map(name=>cache[name])
            //console.log('define', self_name,  name_list, module_list, loader_list)
            cache[self_name] = cb(...module_list)
            let ev = document.createEvent('Event')
            ev.initEvent('defined', true, true)
            self_dom.dispatchEvent(ev)
        })
    }
    define.lib_path = []
    define.cache = cache
    return define
}()
