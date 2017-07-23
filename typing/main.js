
function main () {
    let words = document.getElementById('words')
    let entry = document.getElementById('entry')

    function one_run () {
        let word_list = words.innerText.split(' ')
            .map(w=>w.trim()).filter(w=>w!='')
        let input_list = []

        function counting () {
            let res_list = word_list.map((w,i)=>w==input_list[i])
            let true_count = res_list.filter(b=>b).length
            let false_count = res_list.filter(b=>!b).length
            console.log(res_list)
            return [true_count, false_count]
        }

        function on_entry_change (ev) {
            let value = this.value
            if (value.endsWith(' ')) {
                input_list.push(value.trim())
                this.value = ''

                console.log(counting())
            }
        }

        entry.addEventListener('input', on_entry_change)
    }

    return one_run
}

main()()
