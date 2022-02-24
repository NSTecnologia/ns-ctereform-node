# ns-cte-node

Esta biblioteca possibilita a comunicação e o consumo da solução API para CTe da NS Tecnologia.

Para implementar esta biblioteca em seu projeto, você pode:

1. Realizar a instalação do [pacote](https://www.npmjs.com/package/ns-cte-node) através do npm:

       npm install ns-cte-node

2. Realizar o download da biblioteca pelo [GitHub](https://github.com/NSTecnologia/ns-cte-node/archive/refs/heads/main.zip) e adicionar a pasta "ns-modules" em seu projeto.

# Exemplos de uso do pacote

Para que a comunicação com a API possa ser feita, é necessário informar o seu Token no cabeçalho das requisições. 

Para isso, crie um arquivo chamado `configParceiro.js`, e nele adicione:

       const token = ""
       const CNPJ = ""

       module.exports = {token, CNPJ}
       
Dessa forma, o pacote conseguirá importar as suas configurações, onde você estará informando o token da software house e o cnpj do emitente.

## Emissão

Para realizarmos a emissão de um CTe, vamos utilizar os seguintes métodos.

Primeiramente, vamos fazer referencia da classe *emitirSincrono*, para utilizarmos o método **emitirCTeSincrono**

       const CTeAPI = require('./node_modules/ns-cte-node/ns_modules/cte_module/emissao/emitirSincrono')

O segundo passo é importar, ou construir o arquivo de emissão em **.json** da CTe.

       const CTeJSON = require('./LayoutCTe.json')
           
Apos isso, vamo utilizar o método **sendPostRequest** da classe *EmissaoSincrona* para realizar o envio deste documento CTe para a API.
Este método realiza a emissão, a consulta de status de processamento e o download de forma sequencial.

       var retorno = CTeAPI.emitirCTeSincrono(CTeJSON, "2", "XP", "./docs/cte")
	   retorno.then(getResponse => { console.log(getResponse) })

Os parâmetros deste método são:

+ *CTeJSON* = objeto CTe que será serializado para envio;
+ *2* = tpAmb = ambiente onde será autorizado a CTe. *1 = produção, 2 = homologação / testes* ;
+ *"XP"* = tpDown = tipo de download, indicando quais os tipos de arquivos serão obtidos no Download;
+ *"./docs/cte"* = diretório onde serão salvos os documentos obtidos no download;

O retorno deste método é um objeto json contendo um compilado dos retornos dos métodos realizados pela emissão sincrona:

       responseSincrono {
           statusEnvio: 200,
		   statusConsulta: 200,
		   statusDownload: 200,
		   cStat: 100,
		   motivo: 'Consulta realizada com sucesso',
		   xMotivo: 'Autorizado o uso do CT-e',
		   nsNRec: 16564890,
		   chCTe: '43211007364617000135570000000023851000003303',
		   nProt: '143210001239945',
		   xml: '<?xml version="1.0" encoding="utf-8"?><cteProc versao="3.00" xmlns="http://www.portalfiscal.inf.br/cte"><CTe xmlns="http://www.portalfiscal.inf.br/cte"><infCte versao="3.00",
           json: undefined, // json do CTe autorizada quando tpDown = "J", ou "JP"
           pdf: undefined, // base64 do PDF da CTe ( DACTE ) autorizada quando tpDown = "P", "XP", "JP"
           erros: undefined // array de erros quando a comunicação, emissão, ou processamento apresentar erros
         }
       }
    
Podemos acessarmos os dados de retorno e aplicarmos validações da seguinte forma. Tenhamos como exemplo:

       if ((emissaoResponse.status == 200) || (emissaoResponse.status == -6 || (emissaoResponse.status == -7))) {

        respostaSincrona.statusEnvio = emissaoResponse.status

        let statusBody = new statusProcessamento.Body(
            configParceiro.CNPJ,
            emissaoResponse.nsNRec,
            tpAmb
        )

        let statusResponse = await statusProcessamento.sendPostRequest(statusBody)

        respostaSincrona.statusConsulta = statusResponse.status

        //Verifica se houve sucesso ou não na consulta
        if ((statusResponse.status == 200)) {

            respostaSincrona.cStat = statusResponse.cStat
            respostaSincrona.xMotivo = statusResponse.xMotivo
            respostaSincrona.motivo = statusResponse.motivo
            respostaSincrona.nsNRec = emissaoResponse.nsNRec

            // Verifica se a nota foi autorizada
            if ((statusResponse.cStat == 100) || (statusResponse.cStat == 150)) {

                respostaSincrona.chCTe = statusResponse.chCTe
                respostaSincrona.nProt = statusResponse.nProt

                let downloadBody = new download.Body(
                    statusResponse.chCTe,
                    tpDown,
                    tpAmb
                )

                let downloadResponse = await download.sendPostRequest(downloadBody, caminhoSalvar)

                // Verifica de houve sucesso ao realizar o downlaod da CTe
                if (downloadResponse.status == 200) {
                    respostaSincrona.statusDownload = downloadResponse.status
                    respostaSincrona.xml = downloadResponse.xml
                    respostaSincrona.json = downloadResponse.json
                    respostaSincrona.pdf = downloadResponse.pdf
                }

                // Aqui você pode realizar um tratamento em caso de erro no download
                else {
                    respostaSincrona.motivo = downloadResponse.motivo;
                }
            }

            else {
                respostaSincrona.motivo = statusResponse.motivo;
                respostaSincrona.xMotivo = statusResponse.xMotivo;
            }
        }

        else if (statusResponse.status == -2) {
            respostaSincrona.cStat = statusResponse.cStat;
            respostaSincrona.erros = statusResponse.erro;
        }

        else {
            motivo = statusProcessamento.motivo;
        }
    }

    else if ((emissaoResponse.status == -4) || (emissaoResponse.status == -2)) {

        respostaSincrona.motivo = emissaoResponse.motivo

        try {
            respostaSincrona.erros = emissaoResponse.erros
        }

        catch (error) {
            console.log(error);
        }
    }

    else if ((emissaoResponse.status == -999) || (emissaoResponse.status == -5)) {
        respostaSincrona.motivo = emissaoResponse.motivo
    }

    else {

        try {
            respostaSincrona.motivo = emissaoResponse.motivo
        }

        catch (error) {

            respostaSincrona.motivo = JSON.stringify("ERRO: " + error + "\r\n" + emissaoResponse)
        }
    }

    return respostaSincrona
}


## Eventos

### Cancelar CTe

Para realizarmos um cancelamento de um CTe, devemos gerar o objeto do corpo da requisição e depois, fazer a chamada do método. Veja um exemplo:
       
       const cancelarCTe = require('./node_modules/ns-cte-node/ns_modules/cte_module/eventos/cancelamento')
       const util = require('./node_modules/ns-cte-node/ns_modules/api_module/util')

       let corpo = new cancelarCTe.Body(
       "43211007364617000135570000000023631000003306",
       "2",
       util.dhEmiGet(),
      "143210001238731",
      "CANCELAMENTO REALIZADO PARA TESTES DE INTEGRACAO EXEMPLO NODE JS"
       )

	   cancelarCTe.sendPostRequest(corpo, "X", "./docs/cte/Eventos").then(getResponse => { console.log(getResponse) })
        
Os parâmetros informados no método são:

+ *requisicaoCancelamento* =  Objeto contendo as informações do corpo da requisição de cancelamento;
+ "XP" = tpDown = tipo de download, indicando quais os tipos de arquivos serão obtidos no download do evento de cancelamento;
+ *"./docs/cte/Eventos"* = diretório onde serão salvos os arquivos obtidos no download do evento de cancelamento;

### Carta de Correção para CTe

Para emitirmos uma carta de correção de um CTe, devemos gerar o objeto do corpo da requisição, utilizando a classe *cartaCorrecaoCTe.Body*, e utilzar o método *cartaCorrecaoCTe.sendPostRequest*, da seguinte forma:

       const cartaCorrecaoCTe = require('./node_modules/ns-cte-node/ns_modules/cte_module/eventos/cartaCorrecao')
       const util = require('./node_modules/ns-cte-node/ns_modules/api_module/util')

       let corpo = new cartaCorrecaoCTe.Body(
       "43211007364617000135570000000023611000003301",
       "2",
       util.dhEmiGet(),
        "3",
       {
          "campoAlterado": "xLgr",
          "grupoAlterado": "enderDest",
          "nroItemAlterado": "1",
          "valorAlterado": "ENGENHO - SILO 03"
       }
    )

       cartaCorrecaoCTe.sendPostRequest(corpo, "XP", "./docs/cte/Eventos").then(getResponse => { console.log(getResponse) })
        
Os parâmetros informados no método são:

+ *corpo* =  Objeto contendo as informações do corpo da requisição da carta de correção;
+ "XP" = tpDown = tipo de download, indicando quais os tipos de arquivos serão obtidos no download do evento de carta de correção;
+ *"./docs/cte/Eventos"* = diretório onde serão salvos os arquivos obtidos no download do evento de carta de correção;

### Inutilização de numeração da CTe

Para emitirmos uma inutilização de numeração da CTe, devemos gerar o objeto do corpo da requisição, utilizando a classe *Inutilizacao.Body*, e utilizar o método *Inutilizacao.sendPostRequest*, da seguinte forma:

       const inutilizarCTe = require('./node_modules/ns-cte-node/ns_modules/cte_module/eventos/inutilizacao')

       let corpo = new inutilizarCTe.Body(
       "43",
       "2",
       "21",
       "07364617000135",
       "57",
       "0",
       "2382",
       "2382",
       "INUTILIZACAO REALIZADA PARA TESTES DE INTEGRACAO DO EXEMPLO EM NODE JS"
       )

       inutilizarCTe.sendPostRequest(corpo, "XP", "./docs/cte/Eventos").then(getResponse => { console.log(getResponse) })
        
Os parâmetros informados no método são:

+ *requisicaoInutilizar* =  Objeto contendo as informações do corpo da requisição de inutilização;
+ "XP" = tpDown = tipo de download, indicando quais os tipos de arquivos serão obtidos no download do evento de inutilização;
+ *@"./docs/cte/Eventos"* = diretório onde serão salvos os arquivos obtidos no download do evento de inutilização;

## Utilitários

Ainda com esta biblioteca, é possivel acessar método utilitários da API de CTe. Veja exemplos:

### Consulta de cadastro de contribuinte

       const consultarCadastro = require('./node_modules/ns-cte-node/ns_modules/cte_module/util/consultaCadastro')
    const util = require('./node_modules/ns-cte-node/ns_modules/api_module/util')

    let corpo = new consultarCadastro.Body(
    "07364617000135",
    "RS",
    "0170108708",
    "07364617000135"
    )

    consultarCadastro.sendPostRequest(corpo, "X", "./docs/cte/Eventos").then(getResponse => { console.log(getResponse) })

### Consultar situação de CTe
        
       const consultarCTe = require('./node_modules/ns-cte-node/ns_modules/cte_module/util/consultarSituacao')

       let corpo = new consultarCTe.Body(
       "07364617000135",
       "43211007364617000135570000000023701000003300",
       "2",
       "3.00"
       )

       consultarCTe.sendPostRequest(corpo, "J", "./docs/cte/Eventos").then(getResponse => { console.log(getResponse) })

### Agendamento de Envio de E-Mail de CTe
        
       const enviarEmail = require('./node_modules/ns-cte-node/ns_modules/cte_module/util/envioEmail')

       let corpo = new enviarEmail.Body(
       "43211007364617000135570000000023701000003300",
       "2",
       "true",
       "true",
       "false",
       "cleiton.fagundes@nstecnologia.com.br"
       )

       enviarEmail.sendPostRequest(corpo, "J", "./docs/cte/Eventos").then(getResponse => { console.log(getResponse) })
        
### Listagem de nsNRec's vinculados à um CTe

       const listarNSNRec = require('./node_modules/ns-cte-node/ns_modules/cte_module/util/listarNSNRec')

       let corpo = new listarNSNRec.Body(
       "43211007364617000135570000000023701000003300",
       )

       listarNSNRec.sendPostRequest(corpo, "J", "./docs/cte/Eventos").then(getResponse => { console.log(getResponse) })

### Gerar prévia do CTe 

        const nsAPI = require('./node_modules/ns-cte-node/ns_modules/cte_module/util/previa')
        const CTeJSON = require('./LayoutCTe.json')

        var previa = nsAPI.sendPostRequest(cteJSON).then(getResponse => { console.log(getResponse) })

### Informações Adicionais

Para saber mais sobre o projeto CTe API da NS Tecnologia, consulte a [documentação](https://docsnstecnologia.wpcomstaging.com/docs/ns-cte/)
