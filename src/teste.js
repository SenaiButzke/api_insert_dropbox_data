  
function insertOnDatabase(body) {
    try {
  
      console.log(body)
      var url = 'https://api-insert-dropbox-data.vercel.app/insert';
      
      var headers = {
        'Content-Type': 'application/json'
  
      };
  
      var payload = JSON.stringify(body);
  
      var options = {
        'method': 'post',
        'headers': headers,
        'payload': payload,
      };
  
      var response = UrlFetchApp.fetch(url, options);
      Logger.log(response)
      // var jsonResponse = JSON.parse(response.getContentText());
      // Logger.log('File removed: ' + jsonResponse.metadata.name);
      
    } catch (error) {
      Logger.log('Error removing file: ' + error.toString());
    }
  }

  export default insertOnDatabase;