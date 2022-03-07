const nsAPI = require('../commons/nsAPI')
const downloadEvento = require('./downloadEvento')

const url = "https://cte.ns.eti.br/cte/compentregacanc"

class Body {
    constructor(chCTe, tpAmb, dhEvento, nProt, nProtCE) {
        this.chCTe = chCTe;
        this.tpAmb = tpAmb;
        this.dhEvento = dhEvento;
        this.nProt = nProt;
        this.nProtCE = nProtCE;
    }
}

class Response {
    constructor({ status, motivo, retEvento, xml, json, pdf, erros }) {
        this.status = status;
        this.motivo = motivo;
        this.retEvento = retEvento;
        this.xml = xml;
        this.json = json;
        this.pdf = pdf;
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
                "CANCCOMPENTREGA",
                "1"
            )

            let downloadEventoResponse = await downloadEvento.sendPostRequest(downloadEventoBody, caminhoSalvar, token)

            return downloadEventoResponse
        }
    }

    return responseAPI
}

module.exports = { Body, sendPostRequest }