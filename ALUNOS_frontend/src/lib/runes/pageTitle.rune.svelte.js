
/**
 * @param {string} val
 */
function wrapper(val){
    let title = $state(val)
    return {
        get title() {return title},
        set title(v) { title = `${v} • ON.IPVC v3`},
		clear: () => {
			title = 'ON.IPVC v3';
		}
    }
}

export const pageTitle = wrapper("ON.IPVC v3");