const nsAPI = require('../../api_module/nsAPI')
const url = "https://cte.ns.eti.br/util/list/nsnrecs"

class Body {
    constructor(chCTe) {
        this.chCTe = chCTe;
    }
}

class Response {
    constructor({ status, motivo, nsNRecs, erros }) {
        this.status = status;
        this.motivo = motivo;
        this.nsNRecs = nsNRecs;
        this.erros = erros
    }
}

async function sendPostRequest(conteudo, token) {

    try {

        let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))
        return responseAPI

    }

    catch (error) {
        gravarLinhaLog("[ERRO_LISTAGEM_NSNREC]: " + error)
    }

}

module.exports = { Body, sendPostRequest }
