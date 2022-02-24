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

    let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))

    let downloadEventoBody = new downloadEvento.Body(
        responseAPI.retEvento.chCTe,
        conteudo.tpAmb,
        tpDown,
        "CCE",
        conteudo.nSeqEvento
    )

    let downloadEventoResponse = await downloadEvento.sendPostRequest(downloadEventoBody, caminhoSalvar)

    return downloadEventoResponse
}

module.exports = { Body, sendPostRequest }
