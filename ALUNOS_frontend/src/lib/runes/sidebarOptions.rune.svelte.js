/**
 * @param {string} _currentModule
 * @param {number} _currentModuleId
 * @param {string} _currentObject
 * @param {number} _currentObjectId
 */
function wrapper(_currentModule, _currentModuleId, _currentObject, _currentObjectId){
    let currentModule = $state(_currentModule)
    let currentModuleId = $state(_currentModuleId)
    let currentObject = $state(_currentObject)
    let currentObjectId = $state(_currentObjectId)

    return {
        get currentModule() {return currentModule},
        set currentModule(v) { currentModule = v},
        get currentModuleId() {return currentModuleId},
        set currentModuleId(v) { currentModuleId = v},
        get currentObject() {return currentObject},
        set currentObject(v) { currentObject = v},
        get currentObjectId() {return currentObjectId},
        set currentObjectId(v) { currentObjectId = v}
    }
}


export let sidebarOptions = wrapper("", 0, "", 0)