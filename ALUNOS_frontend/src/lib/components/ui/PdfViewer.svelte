<!-- components/ui/PdfViewer.svelte -->
<script>
    /** @type {{pdfUrl: any}} */
    let { pdfUrl } = $props();
</script>

<div >
    <embed type="application/pdf" src={pdfUrl} width="700vh" height="700vh"/>
</div>
