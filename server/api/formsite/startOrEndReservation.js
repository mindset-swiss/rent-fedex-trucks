const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');

const { handleError } = require('../../api-util/sdk');
const { types } = require('sharetribe-flex-sdk');
const { LatLng } = types;

const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const integrationSdk = flexIntegrationSdk.createInstance({
    clientId: process.env.SHARETRIBE_INTEGRATION_CLIENT_ID,
    clientSecret: process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET
});

const Mapper = {
    transactionId: '2',
    formType: '15',
    date: '1',
    driverName: '12',
    mileage: '16',
    fuelLevel: '4',
    issuesOrDamage: '5',
    conditionAfterRental: '7',
    currentCondition: '9',
    additionalComments: '8',
    exteriorPhotos: '10',
    odoMeterPhotos: '11',
};

module.exports = async (req, res) => {
    try {
        const transactionId = req.body.items.find(i => i.id == Mapper["transactionId"]).value;
        const date = req.body.items.find(i => i.id == Mapper["date"]).value;
        const driverName = req.body.items.find(i => i.id == Mapper["driverName"]).value;
        const mileage = req.body.items.find(i => i.id == Mapper["mileage"]).value;
        const fuelLevel = req.body.items.find(i => i.id == Mapper["fuelLevel"]).value;
        const issuesOrDamage = req.body.items.find(i => i.id == Mapper["issuesOrDamage"]).value;
        const conditionAfterRental = req.body.items.find(i => i.id == Mapper["conditionAfterRental"])?.values[0]?.value;
        const currentCondition = req.body.items.find(i => i.id == Mapper["currentCondition"])?.values[0]?.value;
        const additionalComments = req.body.items.find(i => i.id == Mapper["additionalComments"]).value;
        const odoMeterPhotos = req.body.items.find(i => i.id == Mapper["odoMeterPhotos"]).values;
        const exteriorPhotos = req.body.items.find(i => i.id == Mapper["exteriorPhotos"]).values;
        const formType = req.body.items.find(i => i.id == Mapper["formType"]).values[0].value;

        if (transactionId) {
            await integrationSdk.transactions.updateMetadata({
                id: transactionId,
                metadata: {
                    [formType]: {
                        date,
                        driverName,
                        mileage,
                        fuelLevel,
                        issuesOrDamage,
                        conditionAfterRental,
                        currentCondition,
                        additionalComments,
                        odoMeterPhotos,
                        exteriorPhotos,
                    }
                }
            })

            const { data: listingResponse } = await integrationSdk.transactions.show({
                id: transactionId,
                include: ['listing']
            })
            const listingId = listingResponse?.data?.relationships?.listing?.data?.id.uuid

            await integrationSdk.listings.update({
                id: listingId,
                publicData: {
                    Miles: mileage
                }
            })

            res.status(200)
                .set('Content-Type', 'application/transit+json')
                .send({ success: true });
        } else {
            res.status(400).send("'FedExID' was not provided.");
        };
    } catch (err) {
        handleError(res, err);
    };
};


const getAPI = async (url) => {
    try {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    };
};

const getPlaceInfo = async (inputValue) => {
    const GoogleMapsAPI = "AIzaSyDFSxIB7gNedlSKsX5GRLu807LXyi8KnUE";

    const placeURL = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${inputValue}&types=street_address&key=${GoogleMapsAPI}`;

    const placeRes = await getAPI(placeURL);
    const placeId = placeRes.predictions[0]?.place_id;

    if (placeId) {
        const infoURL = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GoogleMapsAPI}`;

        const infoRes = await getAPI(infoURL);
        const { address_components = [], formatted_address, geometry } = infoRes?.result || {};

        const country = address_components.find(a => a.types.includes("country"))?.short_name;
        const postalCode = address_components.find(a => a.types.includes("postal_code"))?.short_name;

        return {
            country,
            postalCode,
            address: formatted_address,
            geoLocation: geometry.location,
        };
    };
};

const uploadImages = async (imgURLs) => {
    const imagesUploadPromise = imgURLs.map(async (imageUrl, j) => {
        const dirPath = './temp-photos';
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        };
        const filePath = path.resolve(`${dirPath}/${new Date().toISOString().replace(/:/g, '-') + j}.jpg`);

        const promise = new Promise(async (resolve, reject) => {
            try {
                var photoData = await axios({
                    url: imageUrl,
                    responseType: 'stream',
                });
                const writer = fs.createWriteStream(filePath);
                photoData.data.pipe(writer);
                writer.on('finish', async () => {
                    try {
                        const image = await integrationSdk.images.upload(
                            { image: filePath },
                            { expand: true },
                        );
                        fs.unlinkSync(filePath);
                        return resolve(image?.data?.data?.id?.uuid);
                    } catch (err) {
                        console.log(err);
                        fs.unlinkSync(filePath);
                        return resolve();
                    };
                });
            } catch (err) {
                console.log(err);
                return resolve();
            };
        });
        return promise;
    });

    const images = await Promise.all(imagesUploadPromise);
    return images;
};
