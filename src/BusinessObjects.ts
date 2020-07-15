import * as querystring from "querystring";

export interface IAnalyzeParameters {
    language?: string;
    visualFeatures?: Array<VisualFeature>
    details?: Array<Detail>
    queryString?: string
}

export class AnalyzeParameters {
    public language?: 'en' | 'zh' = 'en';
    public visualFeatures?: Array<VisualFeature> = [];
    public details?: Array<Detail> = [];

    constructor(parameters: AnalyzeParameters) {
        Object.assign(this, parameters);
    }

    public queryString?() {
        
        if (this.visualFeatures.length) {
            return querystring.stringify({
                'language': this.language,
                'visualFeatures': this.visualFeatures.join()
            });
        }
        else
        {
            return querystring.stringify({
                'language': this.language                
            });
        }
        
    }    
}

export type VisualFeature = 'Categories' | 'Tags' | 'Description' | 'Faces' | 'ImageType' | 'Color' | 'Adult';
export type Detail = 'Celebrities' | 'Landmarks';


///OCR
export interface Word {
    boundingBox: number[];
    text: string;
    confidence: number;
}

export interface Line {
    boundingBox: number[];
    text: string;
    words: Word[];
}

export interface ReadResult {
    page: number;
    angle: number;
    width: number;
    height: number;
    unit: string;
    lines: Line[];
}

export interface AnalyzeResult {
    version: string;
    readResults: ReadResult[];
}

export class Example {
    status: string;
    createdDateTime: Date;
    lastUpdatedDateTime: Date;
    analyzeResult: AnalyzeResult;

    constructor(example: Example) {
        Object.assign(this, example);
    }

}
