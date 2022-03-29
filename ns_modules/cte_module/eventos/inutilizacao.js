const nsAPI = require('../../api_module/nsAPI')
const downloadInut = require("./downloadInutilizacao")

const url = "https://cte.ns.eti.br/cte/inut"

class Body {
    constructor(cUF, tpAmb, ano, CNPJ, mod, serie, nCTIni, nCTFin, xJust) {
        this.cUF = cUF;
        this.tpAmb = tpAmb;
        this.ano = ano;
        this.CNPJ = CNPJ;
        this.mod = mod;
        this.serie = serie;
        this.nCTIni = nCTIni;
        this.nCTFin = nCTFin;
        this.xJust = xJust;
    }
}

class Response {
    constructor({ status, motivo, retornoInutCTe, erros }) {
        this.status = status;
        this.motivo = motivo;
        this.retornoInutCTe = retornoInutCTe;
        this.erros = erros
    }
}

async function sendPostRequest(conteudo, tpDown, caminhoSalvar, token) {

    try{

        let responseAPI = new Response(await nsAPI.PostRequest(url, conteudo, token))

             if (responseAPI.status == 200) {

                 if (responseAPI.retornoInutCTe.cStat == 102) {

                     let downloadEventoInutBody = new downloadEventoInutBody.Body(
                     responseAPI.retornoInutCTe.chCTe,
                     conteudo.tpAmb,
                     tpDown
            )

                try{

                    await new Promise(resolve => setTimeout(resolve, 500));

                    let downloadEventoInutResponse = await downloadEvento.sendPostRequest(downloadEventoInutBody, caminhoSalvar, token)

                    return downloadEventoInutResponse
                    }

                    catch (error) {
                        util.gravarLinhaLog("[ERRO_DOWNLOAD_EVENTO_INUTILIZACAO]: " + error)
                    }

                }

            }

                return responseAPI

        }
        catch (error) {
            util.gravarLinhaLog("[ERRO_INUTILIZACAO]: " + error)
            return error
        }
}

module.exports = { Body, sendPostRequest }

