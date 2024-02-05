import { GoogleSpreadsheet } from 'google-spreadsheet'

const creds = {
    "type": "service_account",
    "project_id": "indigo-gecko-307403",
    "private_key_id": "b2ce36d53f2dfead92183d1000e3437a285bd798",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDdey5UmaQ/92m1\nu6vZsHN1nE4A6U9d8EhhC9VfZMo8IrWo8uicgMTw+D6Cc2cCb0UGqFkubaGqR+02\n8xu3vF2u/wNqotKHPSmqroUf65wsECiikW3fFYOdyPYd4enmnrv3BvUqs3Ah2MII\nLixIL8F3sgg6JrHbMjrWfYLMFUIVw0F273k7ilxTmzveacXQ2N04FoR9rIvKI492\nXfzHGCDs6HW6z2gEU7KM8w8NduyVgM7FRzBzWfVGIZ9YR9FzH1nh3CF7h/YI2AFf\nRPgQ1L8nbdwH3DVZGwAeXrdn5XxmHCyHKKZT4XwG4ijb+hlAuiAD2Bw2KKGhrjXK\nu2FseVHTAgMBAAECggEAVs8MJr6doTDBLyjiv40ohAWCkVrg78nZJKh1tlET7yQP\nnauvvn++MVCrd4fx7QNdw7FCWy8/OTW95Va+G3LqKUfst+QfrkArz6ldplg7uw2O\nT8G+lbyh/LsitC2y9uBqffUtLNJt9eY2juxCEP0e0GJoVRqLhYWXiDBjjsgaQdqu\nJUdC0x/NzCUu5U4X/cdNqgiwph2R3ZxkSWZQ6qU0V3rTy/NyYk8Tlo7LJ97tZJ1l\nXlubo4pL71gXEHbSabkhyXANtq3kkdHlpKvgN8ZkNdHBXNxxyCDimNWGLlioTDch\nXA7F9bLS59rTvJ3W9S5GD/DkXPdQRVKsKftNUlgOMQKBgQD7O8vcXWFKQ0LwQcDK\nXMKJuIzCGXIm8zUFyDKE6BpdGCc4A+clxgPp9IlzBKwa1dZ6mn2QHfVbQpnSnzXS\nCz/BXIKrcVN6uJ5gGuqnAkGTnQR0VCpUlYiv7gBqBvSgehWgBiiK11ai2bojL7uL\nfRRMjb0u/v+6Tk8+IcWj3QjtuwKBgQDhruG3NuSBHfBbsUKbcOezP9ncPFJQFA0v\nR5elvtv4Tk9gEefTrnxfgZOKNVHyjUI+H9/6+Vs9GmcJdgJkVlj33HcJ/+yDh0Dh\ndAQARmOcolxWccVTUaRdWNbxLuwmDSOGTZgCzj8zC1BjmWSE3UIm/s0UAUvK7QJo\nOI6oYsReyQKBgF973oMmSm+7GJnPo8JFdvp41aZ/nU8IaEKGUA0LWdm/8Eft09Ab\nbilg80xvnimk1BtM1CQN/s5shaHzOLVX6SdITbFzJNMjj63fDQfkZ5/+sU61HlF/\nc6/JuQaTFi5XuBhVvtrl9Nt3/LKa1aCyLSDbTeeqqu7YDG4Ez+TzgQ05AoGBAI1e\nvDvFofwTogX+EwhGAI4zeChSjQlmlh/AzAjidu6jN2upq7vZOEWnaKGR5wR2YkGC\nPA799p5fFJ5DkxoBUPfq3ZKhAyodJpJT11HIxgtPVWI9IGuh38Etrm8kgn8PiepO\nXuObCNHTy4aohuQHqbG9uP9IFI9ISlK44vwt6m6pAoGBANBKoOJmCR/EV7K4OAr7\nRQzngWwM/hTveyEKuUXPjU/Le2NU918o7IRidansloMNaaiiP228UF2X81Xt+/Dv\n8dZHZ15V1Fsk8KRBYI3wmVTPmi7HCsHX1iPMItyFMGU0aC+/sexsjklNTXJiJexn\nC3YuGsp8HlxxRPAZbJDtI9yZ\n-----END PRIVATE KEY-----\n",
    "client_email": "conectgooglesheet@indigo-gecko-307403.iam.gserviceaccount.com",
    "client_id": "109084188435325814005",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/conectgooglesheet%40indigo-gecko-307403.iam.gserviceaccount.com"
  }
  


const Doc = class {
    doc: any
    sheet: any
    rows: any

    constructor(docID: string, auth:any){
        this.doc = new GoogleSpreadsheet(docID,auth)
    }
    async init() {
        await this.doc.useServiceAccountAuth(creds)
        await this.doc.loadInfo()
    }
    async getSheet(title:string) {
        this.sheet = await this.doc.sheetsByTitle[title]
    }

    async getColumnName() {
        return await this.sheet.loadHeaderRow()
    }

    async getRows(){ 
        this.rows = await this.sheet.getRows()
    }

    async insert(obj:object){
        await this.sheet.addRow(obj)
    }
    
    async inserts(obj:object){
        await this.sheet.addRows(obj)
    }

    async updateRows() {
        await this.rows.save()
    }
    
    async clearSheet() {
        await this.sheet.clear()
    }

    async setDefaultHeader() {
        await this.sheet.setHeaderRow("Coverage (%)")
    }

    async setcellvalue(x,y,_value) {
        await this.sheet.loadCells()
        const _cell = await this.sheet.getCell(x, y)
        _cell.value = _value
        await this.sheet.saveUpdatedCells()
    }

    async setcellvaluelink(x,y,_value,_link) {
        await this.sheet.loadCells()
        const _cell = await this.sheet.getCell(x, y)
        //_cell.value = _value
        _cell.formula= `=HYPERLINK("${_link}", "${_value}")`
        await this.sheet.saveUpdatedCells()
    }
    
    async insertRow(obj){
        const object = {
            "ProductId_RoundId" : obj.proId + "_" + obj.drawID,
            "Home" : obj.home,
            "Over" : obj.homeover,
            "Under" : obj.homeunder,
            "Away" : obj.away,
            "Odd" : obj.awayover,
            "Even" : obj.awayunder,
            "HT Home Result" : obj.home_ht_draw_result,
            "Sum HT Home Result" : obj.h_ht_sum,
            "HT Away Result" : obj.away_ht_draw_result,
            "Sum HT Away Result" : obj.a_ht_sum,
            "Sum Half Time" : obj.h_ht_sum + obj.a_ht_sum
        }
        await this.sheet.addRow(object)
    }
}


const collectTestResult = async()=> {
    try {
        const jsonResult = require(`../test-results.json`)
        console.log(jsonResult);
        return jsonResult
        // Get testCase List
        // let totalpassed =  jp.value(jsonResult,'$..stats.passes')
        // let totalfailed =  jp.value(jsonResult,'$..stats.failures')
        // let testSuiteName =  jp.query(jsonResult,'$..tests[0]..fullTitle')
        // let temp = testSuiteName[0].split('======== AUTOMATION TEST RESULT')
        // temp = temp[1].split('========')
        // testSuiteName =temp[0].trim()
        // let finalresult 
        // if (totalpassed==0 && totalfailed==0) {
        //     finalresult = 'Failed-SSO From Member Site'
        // }
        // else{
        //     finalresult = (totalfailed == 0 && totalpassed>0) ? 'Passed' : 'Failed';
        // }
        // return {totalpassed: totalpassed,totalfailed:totalfailed,finalresult:finalresult,testSuiteName:testSuiteName}
    } catch (error) {
        console.log(error);
        return 'NotFound'
    }
}

export const updateTestResutls = async(docID:string,tabname: string)=> {
    let gsheet = new Doc(docID,creds)
    await gsheet.init()
    await gsheet.getSheet(tabname)


    let obj = await collectTestResult()
    await gsheet.clearSheet()
    await gsheet.setDefaultHeader()
    await gsheet.inserts(obj)
}