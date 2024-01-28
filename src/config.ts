export const config = {
    baseUrl: 'https://masaaktif.xlaxiata.co.id/',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    },
    backendUrl: 'https://jupiter-ms-webchecksp.xlaxiata.id',
};

export enum XLRoutes {
    Connect = './connect',
    Detail = './detail',
    ExpiredDate = './expired-date/{phone}',
}
