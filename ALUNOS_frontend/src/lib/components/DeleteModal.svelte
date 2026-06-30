<script                                                                                                                                                                                                                                                                                                 script>
	import { locale } from "$lib/translations/translations";
	import { onMount } from "svelte";
	import toastr from "toastr";

  
  
  


   

     

   
  /** @type {{open?: boolean, showBackdrop?: boolean, onClosed: () => void, tituloPag: any, elem_id: any, module: any, text: any, children?: import('svelte').Snippet}} */
  let {
    open = $bindable(false),
    showBackdrop = true,
    onClosed,
    tituloPag,
    elem_id,
    module,
    text,
    children
  } = $props();

   let nFiles = 1 
   let arr_files = Array.from({length : nFiles},(_,i) => i = i + 1)

   
  const modalClose = () => {
    open = false;
    if (onClosed) {
      onClosed();
    }
  }
  onMount(()=>{
       
  })

   async function del(){
    switch(module){
        case 'listproject_ideas':{
          await deleteProjectIdea()
          break
        }
        case 'application':{
          await deleteApplication()
          break
        }
        case 'rubric':{
          await deleteRubric()
          break
        }
        case 'role':{
          await deleteRole()
          break
        }
        case 'partner-characterization':{
          await deleteCharacterizartion()
          break
        }
        case 'program':{
          await deleteProgram()
          break
        }
        case 'fund':{
          await deleteFund()
          break
        }
        case 'typology':{
          await deleteTypology()
          break
        }
        case 'medida':{
          await deleteMedida()
          break
        }
    }
  }

  async function deleteProjectIdea(){
    let promise = await fetch(`/ep/ugp/deleteProject_idea?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Ideia cancelada com sucesso', 'SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  //
  async function deleteApplication(){
    let promise = await fetch(`/ep/ugp/deleteApplication?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Candidatura cancelada com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro",'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  async function deleteRubric(){
    let promise = await fetch(`/ep/ugp/services/delete_rubric?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Rubrica eliminada com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  async function deleteRole(){
    let promise = await fetch(`/ep/ugp/services/delete_role?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Rubrica eliminada com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  async function deleteCharacterizartion(){
    let promise = await fetch(`/ep/ugp/services/delete_partner_characterization?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Rubrica eliminada com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  async function deleteProgram(){
    let promise = await fetch(`/ep/ugp/services/delete_program?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Programa eliminado com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  async function deleteFund(){
    let promise = await fetch(`/ep/ugp/services/delete_fund?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Fundo eliminado com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  async function deleteTypology(){
    let promise = await fetch(`/ep/ugp/services/delete_typology?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Fundo eliminado com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }

  async function deleteMedida(){
    let promise = await fetch(`/ep/ugp/services/delete_medida?id=${elem_id}`)
    if(promise.status === 200){
        modalClose()
        toastr.success('Medida eliminado com sucesso','SUCESSO', { timeOut: 5000, progressBar: true })
    }else{
        toastr.error("Ocorreu um erro", 'ERRO', { timeOut: 5000, progressBar: true })
    }
  }
  
</script>

  <div class="modal" id="sampleModal" tabindex="-1"
    role="dialog" aria-labelledby="sampleModalLabel" aria-hidden={false}
    style="{open?'display:block':'display:none'}"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="sampleModalLabel">{tituloPag} </h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"
            onclick={modalClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">{#if children}{@render children()}{:else}{text}{/if}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick={modalClose}>Não</button>
          <button class="btn btn-danger" onclick={async() => await del()}>Sim</button>
        </div>
      </div>
    </div>
  </div>
    <div class="modal-backdrop show" style="{open?'display:block':'display:none'}"></div>