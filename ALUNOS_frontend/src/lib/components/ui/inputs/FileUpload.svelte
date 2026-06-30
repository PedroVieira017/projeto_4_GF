<script>
    /** @type {{
	 * multiple?: boolean,
     * selectedFiles?: any[]
     * maxFileSizeMb?: number
     * errorMessage?: string|null
	 * }} */
	let {
		multiple = false,
        selectedFiles = $bindable([]),
        maxFileSizeMb = 1,
        errorMessage = $bindable(null)
	} = $props();

	/**
	 * @param {{ preventDefault: () => void; dataTransfer: { files: any; }; }} event
	 */
	function handleDrop(event) {
		event.preventDefault();
		const files = event.dataTransfer.files;
		displayFileList(files);
	}

	/**
	 * @param {{ preventDefault: () => void; }} event
	 */
	function handleDragOver(event) {
		event.preventDefault();
	}

	/**
	 * @param {any} event
	 */
	// @ts-ignore
	function openFileDialog(event) {
		// @ts-ignore
		document.getElementById('ficheiro').click();
	}

	/**
	 * @param {Iterable<any> | ArrayLike<any>} files
	 */
	function displayFileList(files) {
        if(!multiple) selectedFiles = []

		selectedFiles = [
			...selectedFiles,
			...Array.from(files).filter((file) => !selectedFiles.some((f) => f.name === file.name))
		];
	}

	/**
	 * @param {number | undefined} index
	 */
	function removeFile(index) {
		if (index === undefined) return;
		selectedFiles = [...selectedFiles.slice(0, index), ...selectedFiles.slice(index + 1)];
	}

	/**
	 * @param {{ target: { files: any; }; }} event
	 */
	function handleFileSelect(event) {
		const files = event.target.files;
		const maxSize = maxFileSizeMb * 1024 * 1024; // 1MB
        errorMessage = null;

		for (const file of files) {
			if (file.size > maxSize) {
                errorMessage = "Ficheiro com tamanho superior ao máximo permitido!"
                return;
			}
		}

		displayFileList(files);
	}
</script>

<style>
    .upload-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 5px;
        border: 2px dashed #ccc;
        padding: 40px;
        width: 100%;
        text-align: center;
        position: relative;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        border-radius: 3px;
        color: #c4ccd3;
        background-color: #f8f9fa;
        font-size: 1.5rem;
    }

    .upload-area .info-adicional0 {
        font-size: 0.8rem;
    }

    .upload-area::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    #fileList {
        margin-top: 10px;
    }

    #listItem {
        display: block;
        align-items: center;
        margin-bottom: 8px;
    }
    #btn_eliminar {
        background-color: transparent;
        border: transparent;
        color: #dc3545;
        font-size: 14px;
        cursor: pointer;
    }
</style>

<div class="d-flex">
    <div style="flex: 1; flex-grow: 4" class="upload-area" id="uploadArea" ondrop={handleDrop} ondragover={handleDragOver} onclick={openFileDialog}>
        <!-- svelte-ignore a11y_missing_content -->
        <h1><i class="fas fa-solid fa-upload"></i></h1>
        <div id="info-principal-contrato-file">
            Arraste e solte o ficheiro aqui
            <div class="info-adicional0">ou clique para procurar o ficheiro</div>
            <input type="file" id="ficheiro" name="ficheiro" multiple={multiple} accept=".jpg" onchange={handleFileSelect} style="display: none;" />
        </div>
    </div>

    {#if selectedFiles && selectedFiles.length}
        <div style="flex: 1; flex-grow: 2;" class="px-2">
            <label for="ficheiro">Ficheiros Selecionados</label>
            <div id="fileList" style="max-height: 156px; overflow-y: scroll">
                {#each selectedFiles as file, index}
                    <div id="listItem" class="border p-1">
                        <span id="filename" style="margin-right: 5px">{file.name} <span style="font-size: 11px; color: grey">{file.size}kb</span></span>
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <button id="btn_eliminar" onclick={() => removeFile(index)}>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>