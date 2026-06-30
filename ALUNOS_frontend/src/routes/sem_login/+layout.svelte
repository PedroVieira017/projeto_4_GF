<script>
    // @ts-nocheck
	import Footer from '$lib/components/Footer.svelte';
	import { title } from '$lib/stores/pageTitle';
	import { internalUrls } from '$lib/stores/internalUrls';
    /** @type {{children?: import('svelte').Snippet}} */
    let { children } = $props();
    
    title.set("Sem Login")
</script>


<svelte:head>
    <!-- Fontawsome -->
    <link href="/external/@fortawesome/fontawesome-free/css/all.min.css" rel="stylesheet">

    <!-- Boostrap -->
    <link rel="stylesheet" href="/external/bootstrap/dist/css/bootstrap.min.css">
    
    <!-- Main styles for this application -->
    <link href="/external/CoreUI/css/style.css" rel="stylesheet">
    <link href="/external/CoreUI/css/simple-line-icons.min.css" rel="stylesheet">
    <link href="/external/CoreUI/css/toastr.min.css" rel="stylesheet">
    
    <link href="{$internalUrls["CSS_gridIcon"]}" rel="stylesheet">
    <link href="{$internalUrls["CSS_global"]}" rel="stylesheet">
    <link href="{$internalUrls["CSS_forms"]}" rel="stylesheet">

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
</svelte:head>

<!-- Body -->
{@render children?.()}
