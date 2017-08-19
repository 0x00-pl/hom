
define = function (){
    let cache = {}

    function load_script(name, url, cb){
        let body = document.getElementsByTagName('head')[0]
        let script = document.createElement('script')
        script.addEventListener('load', cb)
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
        if(cache[name] !== undefined){ return cache[name] }
        timeout = timeout || 10000
        let url = lib_path + name + '.js'
        let time_handler = null

        let timer = new Promise((resolve,reject)=>{
            time_handler = setTimeout(timeout, ()=>{cancle_script(name); reject('timeout') })
        })
        let loader = new Promise((resolve,reject)=>{
            load_script(name, url, (ev)=>{
                ev.target.addEventListener('defined', ()=>{
                    clearTimeout(time_handler)
                    resolve(name)
                })
            })
        })

        return Promise.race([timer, loader])
    }

    function define(req, cb){
        cb = cb || (x=>x)
        let loader_list = req.map(name=>resolve_single(name, '', 5000))
        let self_dom = document.currentScript
        let self_name = self_dom.getAttribute('module-name')
        return Promise.all(loader_list).then(name_list => {
            let module_list = name_list.map(name=>cache[name])
            // console.log('define', self_name, self_dom, name_list, module_list, loader_list)
            cache[self_name] = cb(...module_list)
            self_dom.dispatchEvent(new Event('defined'))
        })
    }
    return define
}()
