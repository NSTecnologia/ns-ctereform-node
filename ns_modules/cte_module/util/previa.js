const nsAPI = require('../../api_module/nsAPI')

const url = "https://cte.ns.eti.br/util/previa/cte"

class Response {
    constructor({ status, motivo, pdf, erros }) {
        this.status = status;
        this.motivo = motivo;
        this.pdf = pdf;
        this.erros = erros
    }
}

async function sendPostRequest(conteudo, token) {

    try {

        let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))
        return responseAPI

    }

    catch (error) {
        gravarLinhaLog("[ERRO_OBTER_PREVIA]: " + error)
    }

}

module.exports = { sendPostRequest }

