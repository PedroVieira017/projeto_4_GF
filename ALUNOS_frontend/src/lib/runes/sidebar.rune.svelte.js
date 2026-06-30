/**

 * @param {any} _modules
 * @param {any} _areas
 */
function wrapper(_modules, _areas){
    let modules = $state(_modules)
    let areas = $state(_areas)

    return {
        get modules() {return modules},
        set modules(v) { modules = v},
        get areas() {return areas},
        set areas(v) { areas = v}
    }
}


export let sidebarRune = wrapper(false, false)