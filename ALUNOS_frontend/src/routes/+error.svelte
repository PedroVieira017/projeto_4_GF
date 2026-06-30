<script>
// @ts-nocheck

  import { page } from '$app/stores';
	import { internalUrls } from '$lib/stores/internalUrls';
</script>

<svelte:head>
  <!-- Fontawsome -->
  <link href="/external/@fortawesome/fontawesome-free/css/all.min.css" rel="stylesheet">

  <!-- Boostrap -->
  <link rel="stylesheet" href="/external/bootstrap/dist/css/bootstrap.min.css">
  
  <!-- Main styles for this application -->
  <link href="/external/CoreUI/css/style.css" rel="stylesheet">
  
  
  <link href="{$internalUrls["CSS_gridIcon"]}" rel="stylesheet">
  <link href="{$internalUrls["CSS_global"]}" rel="stylesheet">

  <style>
      .pre-load {
          display: none;
      }
      /* #loading-on {
          height: 90vh !important;
          overflow: hidden;
          display: inline-flex;
          place-self: center center;
          place-items: center;
      } */
      #loading-on {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
      }
      span.dot-on, span.dot-on2, span.dot-on3 {
          -webkit-animation: mover 1s infinite  alternate;
          animation: mover 1s infinite  alternate;
          color: #20a8d8;
          font-size: 72px;
          font-weight: lighter;
          line-height: 0px;
          position: absolute;
      }
      span.dot-on2 {
          -webkit-animation: mover 0.6s infinite  alternate;
          animation: mover 0.6s infinite  alternate;
          margin-left: 10px;
      }
      span.dot-on3 {
          -webkit-animation: mover 0.8s infinite  alternate;
          animation: mover 0.8s infinite  alternate;
          margin-left: 20px;
      }
      @-webkit-keyframes mover {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
      }
      @keyframes mover {
          0% {
              transform: translateY(0);
          }
          100% {
              transform: translateY(-10px);
          }
      }
  </style>

  <!-- Bootstrap and necessary plugins -->
  <script src="/external/jquery/dist/jquery.min.js"></script>
  <script src="/external/bootstrap/dist/js/bootstrap.bundle.min.js"></script>

  <!-- CoreUI main scripts -->
  <script src="/external/CoreUI/app.js"></script>
  <script src="/external/CoreUI/modernizr.custom.js"></script>
  <script src="/external/CoreUI/toastr.min.js"></script>
  <script src="/external/icons.js"></script>

  <!-- External scripts required by modules -->
  <script src="/external/CoreUI/js/jquery.maskedinput.min.js"></script>
  <script src="/external/CoreUI/js/select2.min.js"></script>
  <script src="/external/CoreUI/js/select2.pt.js"></script>
  <script src="/external/CoreUI/js/jquery.dataTables.min.js"></script>
  <script src="/external/CoreUI/js/dataTables.bootstrap4.min.js"></script>
  <script src="/external/dataTables/dataTables.responsive.min.js"></script>
  <script src="/external/CoreUI/js/moment.min.js"></script>
  <script src="/external/CoreUI/js/daterangepicker.min.js"></script>
  <script src="/external/CoreUI/js/quill.min.js"></script>
  
  <script src="/external/dataTables/JSZip-2.5.0/jszip.min.js"></script>
  <script src="/external/dataTables/pdfmake-0.1.36/pdfmake.min.js"></script>
  <script src="/external/dataTables/pdfmake-0.1.36/vfs_fonts.js"></script>
  <script src="/external/dataTables/Buttons-1.6.1/js/dataTables.buttons.min.js"></script>
  <script src="/external/dataTables/Buttons-1.6.1/js/buttons.colVis.min.js"></script>
  <script src="/external/dataTables/Buttons-1.6.1/js/buttons.html5.min.js"></script>
  <script src="/external/dataTables/Buttons-1.6.1/js/buttons.print.min.js"></script>
  <script src="/external/dataTables/checkboxes-1.2.14/js/dataTables.checkboxes.min.js"></script>
</svelte:head>

<div class="p-3">
  <h3>Ocorreu um erro:</h3>
  <h5>{$page.status}: {$page.error.message}</h5>
  {#if !$page.error.ovr_link}
    <p><a href="https://ondev.ipvc.pt/release-2.1/dash.php">Clique aqui para voltar à página inicial.</a></p>
  {:else}
    <p><a href={$page.error.ovr_link}>{$page.error.msg_link || "Clique aqui para voltar atrás."}</a></p>
  {/if}
</div>