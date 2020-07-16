import * as request from 'request';
import { config } from './config';
import * as fs from 'fs';
import * as fileHelpers from './fileHelpers';
import { AnalyzeParameters, IAnalyzeParameters,  Line, Example, ReadResult } from "./BusinessObjects";
import { setInterval } from 'timers';

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
// analyzeImage('./famousperson.jpg', new AnalyzeParameters({
//     details: ['Celebrities']
// }));

//Recognizing landmark
// analyzeImage('./landmark.jpg', new AnalyzeParameters({
//     details: ['Landmarks']
// }));

//Recognizing OCR
//recognizeText('./receipt.jpg',false);

//Recognizing handwriting
//recognizeText('./my_handwriting.png',true);

//Recognizing faces
analyzeImage('./miraj1.jpg', new AnalyzeParameters({
    visualFeatures: ['Faces']
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

function recognizeText(fileName: string, handwriting: boolean) {
    const requestOptions: request.CoreOptions = {
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": config.vision.key1
        },
        body: fileHelpers.readImage(__dirname + "/" + fileName)        
    };

    // let uri = config.vision.endPoint + '/recognizeText?handwriting=' + handwriting;
    let uri ="";
    if (handwriting) {
        uri = config.vision.endPoint + 'read/analyze';
    }
    else
    {
        uri = config.vision.endPoint + 'ocr';
    }
    

    request.post(
        uri,
        requestOptions,
        (err, response, body) => {
            if (response.headers['operation-location']) {
                const requestUrl = response.headers['operation-location'].toString();
                let requestOptions: request.CoreOptions = {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Ocp-Apim-Subscription-Key": config.vision.key1
                    }
                };
    
                const timer = setInterval(() => {
                    // check status
                    request.get(requestUrl, requestOptions,
                        (err, response, body) => {
                            const results = 
                                new Example(JSON.parse(response.body));
                                if (results.status === 'succeeded') {
                                    // and if status is completed, cancel the timer.
                                    clearInterval(timer);
                                    results.analyzeResult.readResults.forEach((readResult:ReadResult) => {
                                        readResult.lines.forEach((line:Line)=>
                                        {
                                            console.log(line);
                                            line.words.forEach((word) => {
                                                console.log(word);
                                        })
                                        
                                        })
                                    })                                    
                                }
                                //  console.log(results.recognitionResult.lines);
                                console.log(results.analyzeResult.readResults[0].lines);
                        });
                }, 1000);
            } else {
                console.log(body);
            }
        }
    );
}