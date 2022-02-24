const nsAPI = require('../../api_module/nsAPI')

const url = "https://cte.ns.eti.br/cte/stats/300"

class Body {
    constructor(licencaCnpj, chCTe, tpAmb, versao) {
        this.licencaCnpj = licencaCnpj;
        this.chCTe = chCTe;
        this.tpAmb = tpAmb;
        this.versao = versao;
    }
}

class Response {
    constructor({ status, motivo, retConsSitCTe, erros }) {
        this.status = status;
        this.motivo = motivo;
        this.retConsSitCTe = retConsSitCTe;
        this.erros = erros
    }
}

async function sendPostRequest(conteudo, token) {

    try {

        let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))
        return responseAPI

    }

    catch (error) {
        gravarLinhaLog("[ERRO_CONSULTA_SITUACAO]: " + error)
    }

}

module.exports = { Body, sendPostRequest }