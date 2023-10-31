import axios, { AxiosResponse } from 'axios';
import 'react-native-url-polyfill/auto';

// https://rapidapi.com/ai-engine-ai-engine-default/api/ocr-wizard
const OcrWizard = async (url: string): Promise<[string | undefined, AxiosResponse | undefined | any]> => {
    const encodedParams = new URLSearchParams();
    encodedParams.set('url', url);

    const options = {
        method: 'POST',
        url: 'https://ocr-wizard.p.rapidapi.com/ocr',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': '693dd75456msh921c376e306158cp12c5dbjsn32ff82c9294a',
            'X-RapidAPI-Host': 'ocr-wizard.p.rapidapi.com'
        },
        data: encodedParams,
    };

    try {
        const response = await axios.request(options);

        if (response &&
            response.data &&
            response.data.body &&
            response.data.body.fullText)
            return [response.data.body.fullText, response]
        else
            return [undefined, response]
    } catch (error: any) {
        return [undefined, error]
    }
}

// https://rapidapi.com/billiejutt/api/image-to-text9
const ImageToText = async (url: string): Promise<[string | undefined, AxiosResponse | undefined | any]> => {
    const options = {
        method: 'GET',
        url: 'https://image-to-text9.p.rapidapi.com/ocr',
        params: { url },
        headers: {
            'X-RapidAPI-Key': '693dd75456msh921c376e306158cp12c5dbjsn32ff82c9294a',
            'X-RapidAPI-Host': 'image-to-text9.p.rapidapi.com'
        }
    }

    try {
        const response = await axios.request(options);

        if (response &&
            response.data &&
            response.data.text)
            return [response.data.text, response]
        else
            return [undefined, response]
    } catch (error: any) {
        return [undefined, error]
    }
}

export const API = async (url: string, apiIndex: number): Promise<[string | undefined, AxiosResponse | undefined | any]> => {
    if (apiIndex === 1)
        return await OcrWizard(url)
    else
        return await ImageToText(url)
}