/**
 * @param {boolean} val
 */
function wrapper(val){
    let languageChangedTemp = $state(val)
    return {
        get bool() {return languageChangedTemp},
        set bool(v) { languageChangedTemp = v}
    }
}

export const languageChangedTemp = wrapper(false)