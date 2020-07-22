import * as request from 'request';
import { config } from './config';
import * as querystring from 'querystring';
import * as fileHelpers from './fileHelpers';
import {setInterval, clearInterval} from 'timers';

// Creates a person group and returns personGroupId
export function createPersonGroup(personGroupId: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        const requestOptions = getRequestOptions();
        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.body = JSON.stringify({
            'name': personGroupId
        });

        request.put(
            config.face.endPoint + '/persongroups/' + personGroupId,
            requestOptions, 
            (err, response, body) => {
                if (err) { reject(false); }
                else { resolve(personGroupId); }                
            }
        )
    });
    return promise;
}

export function deletePersonGroup(personGroupId: string): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
        const requestOptions = getRequestOptions();
        requestOptions.headers['Content-Type'] = 'application/json';
        request.delete(
            config.face.endPoint + '/persongroups' + personGroupId,
            requestOptions,
            (err, response, body) => {
                if (err) { reject(false); }
                else { resolve(true); }                                
            }
        )
    });
    return promise;
}

export function trainPersonGroup(personGroupId: string): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
        const requestOptions = getRequestOptions();
        requestOptions.headers['Content-Type'] = 'application/json';
        request.post(
            config.face.endPoint + '/persongroups/' + personGroupId + '/train',
            requestOptions,
            (err, response, body) => {
                if (err) { reject(false); }
                else {
                    const interval = setInterval(() => {
                        request.get(
                            config.face.endPoint + '/persongroups/' + personGroupId + '/training',
                            requestOptions, 
                            (err, response, body) => {
                                if (JSON.parse(body).status) {
                                    clearInterval(interval);
                                    resolve(true);
                                }
                                else {
                                    console.log('Not trained:');
                                    console.log(body);
                                }
                            }
                        )
                    }, 1000);
                }
            }
        );
    });
    return promise;
}

function getRequestOptions(): request.CoreOptions {
    return {
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": config.face.key1
        }
    };
}