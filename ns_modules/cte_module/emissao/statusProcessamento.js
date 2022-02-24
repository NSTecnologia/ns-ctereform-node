const nsAPI = require('../../api_module/nsAPI')
const url = "https://cte.ns.eti.br/cte/issueStatus/300"

class Body {
    constructor(CNPJ, nsNRec, tpAmb) {
        this.CNPJ = CNPJ;
        this.nsNRec = nsNRec;
        this.tpAmb = tpAmb
    }
}

class Response {
    constructor({ status, motivo, chCTe, cStat, xMotivo, xml, nProt, dhRecbto, erro }) {
        this.status = status;
        this.motivo = motivo;
        this.chCTe = chCTe;
        this.cStat = cStat;
        this.xMotivo = xMotivo;
        this.nProt = nProt;
        this.xml = xml;
        this.dhRecbto = dhRecbto;
        this.erro = erro
    }
}

async function sendPostRequest(body, token) {

    try {
        let responseAPI = new Response(await nsAPI.PostRequest(url, body, token))
        return responseAPI
    }

    catch (error) {
        gravarLinhaLog("[ERRO_CONSULTA_STATUS_PROCESSAMENTO]: " + error)
        return error
    }

}

module.exports = { Body, sendPostRequest }