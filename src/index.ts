import { checkPhoneNumber, extractTokens, findDetailsPathFile, generateAccessToken, generateConnectToken, readPhoneFiles } from "./utils";

const args = process.argv.filter(x => !/(node|bun|\.(ts|js))/gi.test(x));

const fileRequested = args.at(0);
if (!fileRequested) {
    console.error('File not found');
    process.exit(1);
}

const phones: string[] = await readPhoneFiles(fileRequested).catch(err => err.message);
if (typeof phones === 'string' || !phones.length) {
    console.error(Array.isArray(phones) ? 'No phone numbers found' : phones);
    process.exit(1);
}

console.info('Phone numbers found:', phones.length, 'phones');

// This is the part where we find the credentials file
const detailsUrl = await findDetailsPathFile();

console.debug('Extracting tokens from website');

// This is the part where we extract the tokens from the credentials file
const tokens = await extractTokens(detailsUrl);

if (!tokens?.text?.length) {
    console.error('Tokens not found');
    process.exit(1);
}

const authorizationBuffer = generateConnectToken(tokens);
console.debug('Generated connect token:', authorizationBuffer);

const accessToken = await generateAccessToken(authorizationBuffer);
console.debug('Retrieving access token:', accessToken);

console.log('\n\nChecking phone numbers');
phones.forEach(async phone => {
    const result = await checkPhoneNumber(phone, accessToken);
    if (result.status_code !== 200) {
        console.error(`Nomor telepon ${phone} - ${result.error_message}`);
    } else {
        const date = new Date(result.data.expDate);
        console.log(`Nomor telepon ${phone} - expire pada ${date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })} memilik status ${result.data.status} dengan ICCID ${result.data.iccid}`);
    }
});
