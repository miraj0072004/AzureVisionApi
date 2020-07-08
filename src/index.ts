import * as request from 'request';
import { config } from './config';
import * as fileHelpers from './fileHelpers';
import { AnalyzeParameters, IAnalyzeParameters } from "./BusinessObjects";

//analyze Tags,Categories
// analyzeImage('./dog.jpg', new AnalyzeParameters({
//     visualFeatures: ['Tags','Categories']
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
analyzeImage('./racy.jpg', new AnalyzeParameters({
    visualFeatures: ['Adult']
}));

function analyzeImage(fileName: string, params: AnalyzeParameters) {
    const requestOptions: request.CoreOptions = {
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": config.vision.key1
        },
        body: fileHelpers.readImage(__dirname + '/' + fileName)
    };

    let uri = config.vision.endPoint;
    uri = uri + '/analyze?' + params.queryString();
    
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