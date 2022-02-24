const nsAPI = require('../../api_module/nsAPI')
const downloadEvento = require('./downloadEvento')

const url = "https://cte.ns.eti.br/cte/cancel/300"

class Body {
    constructor(chCTe, tpAmb, dhEvento, nProt, xJust) {
        this.chCTe = chCTe;
        this.tpAmb = tpAmb;
        this.dhEvento = dhEvento;
        this.nProt = nProt;
        this.xJust = xJust;
    }
}

class Response {
    constructor({ status, motivo, retEvento, xml, erros }) {
        this.status = status;
        this.motivo = motivo;
        this.retEvento = retEvento;
        this.xml = xml;
        this.erros = erros
    }
}

async function sendPostRequest(conteudo, tpDown, caminhoSalvar, token) {

    let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))

    if (responseAPI.status == 200) {

        if (responseAPI.retEvento.cStat == 135) {

            let downloadEventoBody = new downloadEvento.Body(
                responseAPI.retEvento.chCTe,
                conteudo.tpAmb,
                tpDown,
                "CANC",
                "1"
            )

            let downloadEventoResponse = await downloadEvento.sendPostRequest(downloadEventoBody, caminhoSalvar)

            return downloadEventoResponse
        }
    }

    return responseAPI
}

module.exports = { Body, sendPostRequest }