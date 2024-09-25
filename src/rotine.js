const path = '/teste';
const insertOnDatabase = require('./teste');
const env = require('dotenv').config();


function getAllDropboxFiles(accessToken) {
  try {
    var url = 'https://api.dropboxapi.com/2/files/list_folder';
    var headers = {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    };
    var payload = {
      'path': path,
      'recursive': false
    };

    var options = {
      'method': 'post',
      'headers': headers,
      'payload': JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());

    lista_arquivos = jsonResponse.entries.map(file => path + '/' + file.name)
    return {status:200, data:lista_arquivos}

  } catch (error) {
    return {status:400, message:error}
  }
}

function removeDropboxFile(accessToken, fileToRemove) {
    try {

      var url = 'https://api.dropboxapi.com/2/files/delete_v2';
      
      var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      };
      
      var payload = {
        'path': fileToRemove
      };
      
      var options = {
        'method': 'post',
        'headers': headers,
        'payload': JSON.stringify(payload)
      };
  
      var response = UrlFetchApp.fetch(url, options);
      var jsonResponse = JSON.parse(response.getContentText());
      console.log('File removed: ' + jsonResponse.metadata.name);
      
    } catch (error) {
      console.log('Error removing file: ' + error.toString());
    }
  }

function downloadAndProcessFile(accessToken, fileToDownload, fileName) {
  try {
    var url = 'https://content.dropboxapi.com/2/files/download';

    console.log(JSON.stringify({fileToDownload}))

    var headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
      'Dropbox-API-Arg': JSON.stringify({path:fileToDownload}),
      };
    
    var payload = {
      'path': fileToDownload
    };
  
    var options = {
      'method': 'post',
      'headers': headers,
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var fileBlob = response.getBlob();
    
    const folder = DriveApp.getRootFolder();
    const file = folder.createFile(fileBlob.setName(fileName));
    var fileUrl = file.getUrl()

    console.log('Arquivo salvo no Google Drive: ' +  fileUrl);
    
    var fileId = fileUrl.split("/d/")[1].split("/")[0];
    console.log(fileId);

    const data = getSheetData(fileId)
    return {status:200, data:data}


  } catch (error) {
    console.log('Erro ao baixar o arquivo: ' + error.toString());
    return {status:400, message:error}
  }
}

function getSheetData(fileId) {
  var file = DriveApp.getFileById(fileId);

  var resource = {
    title: file.getName(),
    mimeType: MimeType.GOOGLE_SHEETS
  };

  var spreadsheet = Drive.Files.copy(resource, file.getId());  
  var sheet = SpreadsheetApp.openById(spreadsheet.id).getSheets()[0];
  var data = sheet.getDataRange().getValues();

  return data
  
}

function runScript() {
	console.log("Aqui entrou")
  var accessToken = getToken();
  var responseArquivos = getAllDropboxFiles(accessToken);
  if (responseArquivos.status == 400) {
    responseArquivos = getAllDropboxFiles(accessToken)
    status = responseArquivos.status
  }
  var filesList = responseArquivos.data
  for (var i = 0; i < filesList.length; i++) {
    var path = lista_arquivos[i]
    var nomeArquivo = path.split("/")[2]
    if (nomeArquivo.length > 0) {
      var empresa = nomeArquivo.split(".")[0].split("_")[0]
      var equipamento = nomeArquivo.split(".")[0].split("_")[1]
      if (!equipamento) {
        equipamento = 'Sem equipamento'
      }
      var file = downloadAndProcessFile(accessToken, path, nomeArquivo)
      var dataSheet = getDataFromSheet(file.data)
      
      dataSheet.data.forEach((element) => {
        // console.log(element)
        element.empresa = empresa
				console.log("empresa: " + empresa)
        insertOnDatabase(element)
      });

      removeDropboxFile(accessToken, path);
    }
  }
}

function getDataFromSheet(data) {
  let startIndex = -1;
  let alarmSheet = false;
  let energySheet = false;
  let resultArray = [];
  let typeSheet = '';

  // Determine start index and sheet type
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === 'Event Log Data') {
      startIndex = i + 1;
      alarmSheet = true;
      typeSheet = 'Alarm Data';
      break;
    } else if (data[i][0] === 'Timestamp') {
      startIndex = i + 1;
      energySheet = true;
      typeSheet = 'Energy Data';
      break;
    }
  }

  // Process data if a valid start index was found
  if (startIndex !== -1) {
    for (let j = startIndex; j < data.length; j++) {
      let row = data[j];
      row = row.filter(element=>element != '')
      
      if (alarmSheet) {
        if (row[1] != undefined) {
          let alarmData = {
            source: row[0],
            timestamp: row[1],
            priority: row[2],
            cause: row[3],
            causeValue: row[4],
            effect: row[5],
            effectValue: row[6],
          };

          resultArray.push(alarmData);
        }
      } 

      if (energySheet) {
        if (row[0] != undefined && !String(row[0]).includes('ID')) {
          let energyData = {
            dataImportacao: row[0],
            energiaAparente: row[1],
            demandaAparente: row[2],
            demandaReativa: row[3],
            demandaAtiva: row[4],
            energiaReativa: row[5],
            correnteEletrica: row[6],
            fatorPotencia: row[7],
            energiaInjetada: row[8],
            tensaoEletrica: row[9],
            tensaoEletricaFase: row[10],
            energiaAtiva: row[11],
          };

          resultArray.push(energyData);
        }
      }
    }
  } else {
    console.log('Não foi possível encontrar o índice inicial');
  }

  return { data: resultArray, typeSheet: typeSheet };
}




function getToken() {
	return process.env.REFRESH_TOKEN

}






export default runScript;