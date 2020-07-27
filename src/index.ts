import * as request from 'request';
import { config } from './config';
import * as fs from 'fs';
import * as fileHelpers from './fileHelpers';
import { AnalyzeParameters, IAnalyzeParameters,  Line, Example, ReadResult } from "./BusinessObjects";
import { setInterval } from 'timers';
import * as querystring from 'querystring';
import * as faceHelpers from './FaceHelpers';

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
//recognizeText('./chess_sheet.jpg',true);

//Recognizing faces
// analyzeImage('./miraj1.jpg', new AnalyzeParameters({
//     visualFeatures: ['Faces']
// }));

//Analyze faces with face api
//analyzeFaces('./disgust.jpg');

function analyzeFaces(fileName: string) {
    const requestOptions: request.CoreOptions = {
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": config.face.key1
        },
        body: fileHelpers.readImage(__dirname + '/' + fileName)
    };

    const params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        // "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
        "returnFaceAttributes": "emotion",
    };

    let uri = config.face.endPoint + '/detect?' + querystring.stringify(params);

    request.post(
        uri, 
        requestOptions,
        (err, response, body) => {
            console.log(body);
        }
    );    
}


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

//step 1: create personGroup here
const personGroupId = 'myfriends';

// faceHelpers.createPersonGroup(personGroupId).then(result => {
//     if (result === personGroupId) {
//         console.log('person group created');
//         const friends = fileHelpers.getFriends('Data');
//         friends.forEach(friend => {
//             faceHelpers.createPerson(personGroupId, friend).then(result => {
//                 const personId = result;
//                 console.log(`Created personId: ${result} for person: ${friend}`)
//                 const friendPictures = fileHelpers.getFriendPictures(friend);
//                 friendPictures.forEach(friendPicture => {
//                     const friendFaceFileName = __dirname + '/Data/' + friend + '/' + friendPicture;
//                     faceHelpers.addPersonFace(
//                         friendFaceFileName,
//                         personId,
//                         personGroupId
//                     ).then(result => {
//                         console.log(`For personId: ${result} person: ${friend} added face: ${friendPicture} got persistedFaceId: ${result}`);
//                     });
//                 });
//             });
//         });
//     }
// });

//step 2: train personGroup

// faceHelpers.trainPersonGroup(personGroupId).then(result => {
//     if (result) console.log('person group trained');
// });

//step 3: Detecting and identifying a person

// faceHelpers.detectFace('./input.jpg').then(faceId => {
//     faceHelpers.identifyPerson(personGroupId,faceId).then(result =>{
//         console.log('Input recognized as: '+ result);
//     });    
// });

//step 4 Delet the person group after working with it
faceHelpers.deletePersonGroup(personGroupId).then(result =>{
    if (result) {
        console.log('person group deleted');
    }
    else{
        console.log('error deleting the person group');
    }
});


