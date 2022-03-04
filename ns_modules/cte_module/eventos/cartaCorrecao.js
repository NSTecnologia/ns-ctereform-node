const nsAPI = require('../../api_module/nsAPI')
const downloadEvento = require('./downloadEvento')

const url = "https://cte.ns.eti.br/cte/cce/300"

class Body {
    constructor(chCTe, tpAmb, dhEvento, nSeqEvento, infCorrecao) {
        this.chCTe = chCTe;
        this.tpAmb = tpAmb;
        this.dhEvento = dhEvento;
        this.nSeqEvento = nSeqEvento;
        this.infCorrecao = infCorrecao;
    }
}

class Response {
    constructor({ status, motivo, retEvento, erros }) {
        this.status = status;
        this.motivo = motivo;
        this.retEvento = retEvento;
        this.erros = erros
    }
}

async function sendPostRequest(conteudo, tpDown, caminhoSalvar, token) {

    try {

        let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))

        if (responseAPI.status == 200) {

            if (responseAPI.retEvento.cStat == 135) {

                let downloadEventoBody = new downloadEvento.Body(
                    responseAPI.retEvento.chNFe,
                    conteudo.tpAmb,
                    tpDown,
                    "CCe",
                    conteudo.nSeqEvento
                )

                try {
                    let downloadEventoResponse = await downloadEvento.sendPostRequest(downloadEventoBody, caminhoSalvar)

                    return downloadEventoResponse
                }

                catch (error) {
                    gravarLinhaLog("[ERRO_DOWNLOAD_EVENTO_CORRECAO]: " + error)
                }

            }
        }

        return responseAPI
    }
    
    catch (error) {
        gravarLinhaLog("[ERRO_CANCELAMENTO]: " + error)
        return error
    }
}

module.exports = { Body, sendPostRequest }
