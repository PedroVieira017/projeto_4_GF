<script>
  import { t } from '$lib/translations/translations';

  

  

  

  

  
  /** @type {{titulo: string, open?: boolean, form?: any, showBackdrop?: boolean, onClosed: () => void, children?: import('svelte').Snippet}} */
  let {
    titulo,
    open = $bindable(false),
    form = null,
    showBackdrop = true,
    onClosed,
    children
  } = $props();

  const modalClose = () => {
    open = false;
    if (onClosed) {
      onClosed();
    }
  }

</script>
<style>
  .modal-body {
    max-height: 500px;
    overflow-y: auto;  
  }
</style>
<div
  class="modal {open ? 'd-block' : 'd-none'}"
  id="sampleModal"
  tabindex="-1"
  role="dialog"
  aria-labelledby="sampleModalLabel"
  aria-hidden={false}
>
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="sampleModalLabel">{titulo}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="{$t('modal.actions.close')}"
                onclick={modalClose}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        {@render children?.()}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" onclick={modalClose}>
          {$t('modal.actions.no')}
        </button>
        <button type={form?"submit":"button"} form={form?form:""} class="btn btn-danger">
          {$t('modal.actions.yes')}
        </button>
      </div>
    </div>
  </div>
</div>
{#if showBackdrop}
  <div class="modal-backdrop show {open ? 'd-block' : 'd-none'}"></div>
{/if}



