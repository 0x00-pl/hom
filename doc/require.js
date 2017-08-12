

function load_script(name, url, cb){
    let body = document.getElementByTagName('head')[0]
    let script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('charset', 'utf-8')
    script.setAttribute('async', '')
    script.setAttribute('module-name', name)
    script.setAttribute('src', url)
    script.addEventListener('onload', cb)
    body.appendChild(script)
    return script
}
function cancle_script(name){
    let body = document.getElementByTagName('head')[0]
    let scripts = body.getElementsByTagName('script')
    Array.filter(scripts, t=>t.getAttribute('module-name')===name).forEach(t=>body.removeChild(t))
}

function resolve_single(name, lib_path, timeout){
    timeout = timeout || 10000
    let url = lib_path + name + '.js'
    let time_handler = null

    let timer = new Promise((resolve,reject)=>{
        time_handler = setTimeout(timeout, ()=>{cancle_script(name); reject('timeout') })
    })
    let loader = new Promise((resolve,reject)=>{
        load_script(name, url, (...args)=>{console.log(...args); cleanTimeout(time_handler); resolve(args)})
    })

    return Promise.race([timer, loader])
}


