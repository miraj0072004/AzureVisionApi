import * as request from 'request';
import { config } from './config';
import * as fs from 'fs';
import * as fileHelpers from './fileHelpers';
import { AnalyzeParameters, IAnalyzeParameters } from "./BusinessObjects";

//analyze Tags,Categories
// analyzeImage('./dog.jpg', new AnalyzeParameters({
//     visualFeatures: ['Tags','Categories']
// }));

//analyze Description
// analyzeImage('./famousperson.jpg', new AnalyzeParameters({
//     visualFeatures: ['Description']
// }));

//analyze Color
// analyzeImage('./famousperson.jpg', new AnalyzeParameters({
//     visualFeatures: ['Color']
// }));

//analyze clip art vs line art
// analyzeImage('./dog_clipart.jpg', new AnalyzeParameters({
//     visualFeatures: ['ImageType']
// }));

//analyze adult picture
// analyzeImage('./racy.jpg', new AnalyzeParameters({
//     visualFeatures: ['Adult']
// }));

//generate Thumbnails
//generateThumbnail('./dog.jpg');

//Recognizing celebrities
analyzeImage('./famousperson.jpg', new AnalyzeParameters({
    details: ['Celebrities']
}));


function generateThumbnail(fileName: string) {
    const requestOptions: request.CoreOptions = {
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": config.vision.key1
        },
        body: fileHelpers.readImage(__dirname + '/' + fileName)
    };

    let uri = config.vision.endPoint + '/generateThumbnail?width=50&height=50&smartCropping=true';

    

    request.post(
        uri,
        requestOptions
    ).pipe(fs.createWriteStream(__dirname + '/output.jpeg'));
}

function analyzeImage(fileName: string, params: AnalyzeParameters) {
    const requestOptions: request.CoreOptions = {
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": config.vision.key1
        },
        body: fileHelpers.readImage(__dirname + '/' + fileName)
    };

    let uri = config.vision.endPoint;

    if (params.details.length) {
        uri = uri + 'analyze?details='+ params.details.join()+'&' + params.queryString();
    }else{
        uri = uri + 'analyze?' + params.queryString();
    }
    
    
    request.post(
        uri, 
        requestOptions,
        (err, response, body) => {
            console.log(body);
        }
    );    
}

//describeImage('./dog.jpg');

function describeImage(fileName: string) {
    const requestOptions: request.CoreOptions = {
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": config.vision.key1
        },
        body: fileHelpers.readImage(__dirname + '/' + fileName)
    };

    let uri = config.vision.endPoint;
    uri = uri + 'describe?maxCandidates=3';

    request.post(
        uri, 
        requestOptions,
        (err, response, body) => {
            console.log(body);
        }
    );
}