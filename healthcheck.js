const https = require('https');

var startTime = new Date();

https.get('https://api.bcflex.com/api/health/tick', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        var endTime = new Date();
        var dataParsed = JSON.parse(data);
        var elapsed = endTime - startTime;

        https.get('https://api.bcflex.com/api/health/tock?elapsed=' + elapsed + '&location=' + dataParsed.location + '&timeStamp=' + dataParsed.timestamp);

    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});