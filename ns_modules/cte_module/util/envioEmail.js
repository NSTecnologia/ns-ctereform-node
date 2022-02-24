const nsAPI = require('../../api_module/nsAPI')

const url = "https://cte.ns.eti.br/util/resendemail"

class Body {
    constructor(chCTe, tpAmb, enviaEmailDoc, anexarPDF, anexarEvento, email) {
        this.chCTe = chCTe;
        this.tpAmb = tpAmb;
        this.enviaEmailDoc = enviaEmailDoc;
        this.anexarPDF = anexarPDF;
        this.anexarEvento = anexarEvento;
        this.email = email;
    }
}

class Response {
    constructor({ status, motivo, erro }) {
        this.status = status;
        this.motivo = motivo;
        this.erro = erro;
    }
}

async function sendPostRequest(conteudo, token) {

    try {

        let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))
        return responseAPI

    }

    catch (error) {
        gravarLinhaLog("[ERRO_ENVIO_EMAIL]: " + error)
    }

}

module.exports = { Body, sendPostRequest }
