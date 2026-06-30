<script>
</script>

<svelte:head>
  <!-- Fontawsome -->
  <link href="/external/@fortawesome/fontawesome-free/css/all.min.css" rel="stylesheet">

  <!-- Boostrap -->
  <link rel="stylesheet" href="/external/bootstrap/dist/css/bootstrap.min.css">
  
  <!-- Main styles for this application -->
  <link href="/external/CoreUI/css/style.css" rel="stylesheet">
  <link href="/logos/grid_icons_login.css" rel="stylesheet">
  
  <title>Erro • ON.IPVC_v3</title>

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

  
</svelte:head>

<div class="p-3" style="height: 100vh">
  <h3>Página sem conteúdo. Utilize a URL para navegar até às páginas específicas.</h3>
  <h3><a href="/exemplos" target="_self">Entrar nas Páginas exemplo</a></h3>
  <ul>
    <li>Ligações úteis:</li>
    <ul>
        <li>FontAwsome Icons - <a href="https://fontawesome.com/v5/search?ic=free&o=r">https://fontawesome.com/v5/search?ic=free&o=r</a></li>
        <li>Bootstrap 4.3.1 - <a href="https://getbootstrap.com/docs/4.3/getting-started/introduction/">https://getbootstrap.com/docs/4.3/getting-started/introduction/</a></li>
    </ul>
  </ul>
</div>