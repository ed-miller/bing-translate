var https = require('https'),
  http = require('http'),
  querystring = require('querystring'),
  client = {},
  credentials = {},
  regx = /<string [a-zA-Z0-9=":/.]+>(.*)<\/string>/;

exports.init = function(creds){
  client.credentials = creds;
  return client;
}

client.setCredentials = function(creds){
  client.credentials = creds;
}

client.translate = function(text, from, to, callback){
  client.getToken(client.credentials, function(err, token){
    var req = https.request({
      host: 'api.microsofttranslator.com',
      port: 443,
      path: '/v2/http.svc/Translate?text='+encodeURIComponent(text)+'&from='+from+'&to='+to+'&contentType=text/plain',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    req.on('response', function(response){
      var data = '';
      response.on('data', function(chunk){
        data += chunk;
      });
      response.on('end', function(){
        var error, translation;
        try {
          translation = regx.exec(data)[1];
        } catch(e) {
          error = 'parse-exception';
        }
        callback(error, {
          original_text: text,
          translated_text: translation,
          from_language: from,
          to_language: to,
          response: data
        });
      });
    });
    req.on('error', function(e){
      callback(new Error(e.message), null);
    });
    req.end();
  });
}

client.detect = function(text, callback){
    client.getToken(client.credentials, function(err, token){
        var req = http.request({
            host: 'api.microsofttranslator.com',
            port: 80,
            path: '/V2/Http.svc/Detect?text='+encodeURIComponent(text)+'&contentType=text/plain',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer '+token.access_token
            }
        });
        req.on('response', function(response){
            var data = '';
            response.on('data', function(chunk){
                data += chunk;
            });
            response.on('end', function(){
                var error, translation;
                try {
                    translation = regx.exec(data)[1];
                } catch(e) {
                    error = 'parse-exception';
                }
                callback(error, {
                    original_text: text,
                    response: data
                });
            });
        });
        req.on('error', function(e){
            callback(new Error(e.message), null);
        });
        req.end();
    });
}

client.getLanguagesForTranslate = function(callback){
    client.getToken(client.credentials, function(err, token){
        var req = http.request({
            host: 'api.microsofttranslator.com',
            port: 80,
            path: '/V2/Http.svc/GetLanguagesForTranslate?contentType=text/plain',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer '+token.access_token
            }
        });
        req.on('response', function(response){
            var data = '';
            response.on('data', function(chunk){
                data += chunk;
            });
            response.on('end', function(){
                var error, translation;
                try {
                    translation = regx.exec(data)[1];
                } catch(e) {
                    error = 'parse-exception';
                }
                callback(error, {
                    response: data
                });
            });
        });
        req.on('error', function(e){
            callback(new Error(e.message), null);
        });
        req.end();
    });
}

client.getToken = function(credentials, callback){
  var req = https.request({
    hostname: 'api.cognitive.microsoft.com',
    port: 443,
    path: '/sts/v1.0/issueToken',
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': credentials.client_id
    },
  }, function(res){
    res.setEncoding('utf8');

    var data = '';
    res.on('data', function(chunk){
      data += chunk;
    });
    res.on('end', function(){
      callback(null, data);
    });
  });
  req.on('error', function(e){
    callback(new Error(e.message), null);
  });
  req.end();
}
