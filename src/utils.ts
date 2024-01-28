import crypto from 'node:crypto';

import { XLRoutes, config } from "./config"
import type { Tokens } from './types';

export const readPhoneFiles = async (file: string) => {
    const bunFile = Bun.file(file);
    const contents = await bunFile.text();

    return contents.split('\n').filter(x => x.length && /[0-9]+/g.test(x)).map(x => x.trim());
}

export const findDetailsPathFile = async () => {
    const fullUrl = new URL(XLRoutes.Detail, config.baseUrl);

    const response = await fetch(fullUrl.href, {
        headers: config.headers,
    });

    const regexFinder = /(\/_next\/static\/chunks\/pages\/detail-[a-zA-Z0-9]+\.js)/gi;

    const matchedFile = regexFinder.exec(await response.text())?.[0];
    return new URL(matchedFile ?? '/', config.baseUrl).href;
}

export const extractTokens = async (detailsUrl: string) => {
    const response = await fetch(detailsUrl, {
        headers: config.headers,
    });

    const text = await response.text();
    const regexFinder = /createCipheriv\("aes\-256\-cbc","(\w+)","(\w+)"\)/gi;
    const matches = regexFinder.exec(text);

    if (matches?.length === 3) {
        const authorizationKey = /authorization:"([a-zA-Z0-9_-]+::[a-zA-Z0-9]+)"/gi.exec(text)?.at(-1);
        return {
            key: matches[1],
            iv: matches[2],
            text: authorizationKey,
        }
    }

    return undefined;
}

export const generateConnectToken = (keys: Tokens) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', keys.key, keys.iv);

    return Buffer.concat([cipher.update(keys.text ?? '', 'utf8'), cipher.final()]).toString('base64');
}

export const generateAccessToken = async (connectToken: string): Promise<string> => {
    const fullUrl = new URL(XLRoutes.Connect, config.backendUrl);

    const response = await fetch(fullUrl, {
        headers: {
            ...config.headers,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            Authorization: connectToken,
        }),
    });

    const json = await response.json();
    return json.access_token;
}

export const checkPhoneNumber = async (phone: string, token: string) => {
    if (phone.startsWith('08')) {
        phone = `62${phone.slice(1)}`;
    }

    const fullUrl = new URL(XLRoutes.ExpiredDate.replace('{phone}', phone), config.backendUrl);

    const response = await fetch(fullUrl, {
        headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        },
    }).catch(e => e.response);

    const json = await response.json();

    return json;
}
