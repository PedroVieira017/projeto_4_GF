export var TIPOS_EMAIL = {
    "email_exemplo": {
        campos: {
            id_utilizador: {
                obrigatorio: true,
                nome: "id_utilizador",
                com_valor: true // não aceita valores "falsy" (null, "", false, ...)
            },
            nome_projeto: {
                obrigatorio: true,
                nome: "nome_projeto",
                com_valor: true // não aceita valores "falsy" (null, "", false, ...)
            }
        },
        template: function(id_utilizador, nome_projeto) { 
            return `<html>
            <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <style>
                td,table {border: 0px;}
            
                .cabecalho, .rodape {
                font-family : Verdana, Arial, helvetica, sans-serif;
                font-size : 12px;
                font-weight: bold;
                color: #FFFFFF;
                background-color: #fdbd5c;
                padding: 3px;
                }
            
                .corpo_msg {
                font-family : Verdana, Arial, helvetica, sans-serif; font-size : 11px; color: #222222; padding: 3px;
                }
            
                .rodape {
                font-family : Verdana, Arial, helvetica, sans-serif;
                font-size : 10px;
                font-weight: bold;
                color: #FFFFFF;
                background-color: #fdbd5c;
                padding: 3px;
                }
            </style>
            </head>
            <body>
                <table cellpadding="0" cellspacing="0" border="0"> 
                    <tr height="10">
                        <td></td>
                    </tr>
                    <tr height="17">
                        <td class="cabecalho">ON - IPVC</td>
                    </tr>
            
                    <tr height="10">
                        <td>&nbsp;</td>
                    </tr>
                
                    <tr>
                        <td class="corpo_msg">
                        Caro(a) ${id_utilizador},
                            <br><br>foi <b>adicionado</b> um novo projeto escola inclusiva, ${nome_projeto}.
                            <br><br><a href=http://on.ipvc.pt>IPVC | ON</a>
                        </td>
                    </tr>
                    <tr height="8">
                        <td>&nbsp;</td>
                    </tr>
                    <tr valign="top">
                        <td class="corpo_msg">
                        <br>
                        Com os melhores cumprimentos.<br><br>
                        <i>
                        IPVC ON . Sistemas de Informação<br>
                        Instituto Politécnico de Viana do Castelo
                        </i>
                        </td>
                    </tr>
                    <tr height="15">
                        <td>&nbsp;</td>
                    </tr>
            
                    <tr height="17">
                            <td class="rodape">Email gerado automaticamente por: IPVC | ON . Notificação ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</td>
                    </tr>
                </table>
            </body>
            </html>`
        }
    },
}