const nsAPI = require('../../api_module/nsAPI')
const util = require('../../api_module/util')

const url = "https://cte.ns.eti.br/cte/download/inut"

class Body {
    constructor(chave, tpAmb) {
        this.chave = chave;
        this.tpAmb = tpAmb;
    }
}

class Response {
    constructor({ status, motivo, retInut, erro }) {
        this.status = status;
        this.motivo = motivo;
        this.retInut = retInut;
        this.erro = erro
    }
}

async function sendPostRequest(conteudo, caminhoSalvar, token) {

    try {


        let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))

        if (responseAPI.retInut.json != null && caminhoSalvar !==null) {
            util.salvarArquivo(caminhoSalvar, responseAPI.retInut.chave, "-procInut.json", responseAPI.retInut.json)
        }

        if (responseAPI.retInut.pdf != null && caminhoSalvar !==null) {
            let data = responseAPI.retInut.pdf;
            let buff = Buffer.from(data, 'base64');
            util.salvarArquivo(caminhoSalvar, responseAPI.retInut.chave, "-procInut.pdf", buff)
        }

        if (responseAPI.retInut.xml != null && caminhoSalvar !==null) {
            util.salvarArquivo(caminhoSalvar, responseAPI.retInut.chave, "-procInut.xml", responseAPI.retInut.xml)
        }

        return responseAPI

    }

    catch (error) {
        util.gravarLinhaLog("[ERRO_DOWNLOAD_INUTILIZACAO]: " + error)
        return error
    }

}

module.exports = { Body, sendPostRequest }
