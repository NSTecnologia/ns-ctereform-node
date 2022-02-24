const statusProcessamento = require('./statusProcessamento')
const download = require('./download')
const emitir = require('./emitir')

class ResponseSincrono {
    constructor(statusEnvio, statusConsulta, statusDownload, cStat, motivo, xMotivo, nsNRec, chCTe, nProt, xml, json, pdf, erros) {
        this.statusEnvio = statusEnvio;
        this.statusConsulta = statusConsulta;
        this.statusDownload = statusDownload;
        this.cStat = cStat;
        this.motivo = motivo;
        this.xMotivo = xMotivo;
        this.nsNRec = nsNRec;
        this.chCTe = chCTe;
        this.nProt = nProt;
        this.xml = xml;
        this.json = json;
        this.pdf = pdf;
        this.erros = erros;
    }
}
async function emitirCTeSincrono(conteudo, tpAmb, tpDown, CNPJLicenca, caminhoSalvar, token) {

    let respostaSincrona = new ResponseSincrono();
    let emissaoResponse = await emitir.sendPostRequest(conteudo, token)

    if ((emissaoResponse.status == 200) || (emissaoResponse.status == -6 || (emissaoResponse.status == -7))) {

        respostaSincrona.statusEnvio = emissaoResponse.status
        let statusBody = new statusProcessamento.Body(
            CNPJLicenca,
            emissaoResponse.nsNRec,
            tpAmb
        )
        let statusResponse = await statusProcessamento.sendPostRequest(statusBody, token)

        respostaSincrona.statusConsulta = statusResponse.status

        if ((statusResponse.status == 200)) {

            respostaSincrona.cStat = statusResponse.cStat
            respostaSincrona.xMotivo = statusResponse.xMotivo
            respostaSincrona.motivo = statusResponse.motivo
            respostaSincrona.nsNRec = emissaoResponse.nsNRec

            if ((statusResponse.cStat == 100) || (statusResponse.cStat == 150)) {

                respostaSincrona.chCTe = statusResponse.chCTe
                respostaSincrona.nProt = statusResponse.nProt

                let downloadBody = new download.Body(
                    statusResponse.chCTe,
                    tpDown,
                    tpAmb
                )

                let downloadResponse = await download.sendPostRequest(downloadBody, caminhoSalvar, token)

                if (downloadResponse.status == 200) {
                    respostaSincrona.statusDownload = downloadResponse.status
                    respostaSincrona.xml = downloadResponse.xml
                    respostaSincrona.json = downloadResponse.json
                    respostaSincrona.pdf = downloadResponse.pdf
                }

                else {
                    respostaSincrona.motivo = downloadResponse.motivo;
                }
            }

            else {
                respostaSincrona.motivo = statusResponse.motivo;
                respostaSincrona.xMotivo = statusResponse.xMotivo;
            }
        }

        else if (statusResponse.status == -2) {
            respostaSincrona.cStat = statusResponse.cStat;
            respostaSincrona.erros = statusResponse.erro;
        }

        else {
            motivo = statusProcessamento.motivo;
        }
    }

    else if ((emissaoResponse.status == -4) || (emissaoResponse.status == -2)) {

        respostaSincrona.motivo = emissaoResponse.motivo

        try {
            respostaSincrona.erros = emissaoResponse.erros
        }

        catch (error) {
            console.log(error);
        }
    }

    else if ((emissaoResponse.status == -999) || (emissaoResponse.status == -5)) {
        respostaSincrona.motivo = emissaoResponse.motivo
    }

    else {

        try {
            respostaSincrona.motivo = emissaoResponse.motivo
        }

        catch (error) {

            respostaSincrona.motivo = JSON.stringify("ERRO: " + error + "\r\n" + emissaoResponse)
        }
    }

    return respostaSincrona
}

module.exports = { ResponseSincrono, emitirCTeSincrono }
