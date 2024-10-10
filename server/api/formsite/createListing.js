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
    OwnerFirstName: '14',
    OwnerLastName: '15',
    CompanyName: '6',
    PhoneNumber: '10',
    year: '1',
    Make: '2',
    Model: '3',
    Box_length: '4',
    Miles: '12',
    Plate_number: '13',
    VIN: '5',
    categoryLevel1: '17',
    FedExID: '16',
    RentalLocation: '18',
    RegistrationCopy: '7',
    ProofOfInsurance: '9',
    TruckPictures: '11',
    GVWR: '21',
    price: '19',
    availability: '20',
};

module.exports = async (req, res) => {
    try {
        // const OwnerFirstName = req.body.items.find(i => i.id == Mapper["OwnerFirstName"]).value;
        // const OwnerLastName = req.body.items.find(i => i.id == Mapper["OwnerLastName"]).value;
        // const CompanyName = req.body.items.find(i => i.id == Mapper["CompanyName"]).value;
        // const PhoneNumber = req.body.items.find(i => i.id == Mapper["PhoneNumber"]).value;
        const year = req.body.items.find(i => i.id == Mapper["year"]).values[0].value;
        const Make = req.body.items.find(i => i.id == Mapper["Make"]).values[0].value;
        const Model = req.body.items.find(i => i.id == Mapper["Model"]).value;
        const Box_length = Number(req.body.items.find(i => i.id == Mapper["Box_length"]).value);
        const Miles = Number(req.body.items.find(i => i.id == Mapper["Miles"]).value);
        const Plate_number = req.body.items.find(i => i.id == Mapper["Plate_number"]).value;
        const VIN = req.body.items.find(i => i.id == Mapper["VIN"]).value;
        const categoryLevel1 = req.body.items.find(i => i.id == Mapper["categoryLevel1"]).values[0].value;
        const FedExID = req.body.items.find(i => i.id == Mapper["FedExID"]).value;
        const RentalLocation = req.body.items.find(i => i.id == Mapper["RentalLocation"]).value;
        const RegistrationCopy = req.body.items.find(i => i.id == Mapper["RegistrationCopy"]).values;
        const ProofOfInsurance = req.body.items.find(i => i.id == Mapper["ProofOfInsurance"]).values;
        const TruckPictures = req.body.items.find(i => i.id == Mapper["TruckPictures"]).values;
        const GVWR = Number(req.body.items.find(i => i.id == Mapper["GVWR"]).value);
        const price = req.body.items.find(i => i.id == Mapper["price"]).value;
        const availabilityDays = req.body.items.find(i => i.id == Mapper["availability"])?.values || [];

        const title = `${year} ${Make} ${Model} ${Box_length} ${categoryLevel1}`;
        const publicDataItems = {
            // OwnerFirstName,
            // OwnerLastName,
            // CompanyName,
            // PhoneNumber,
            year,
            Make,
            Model,
            Box_length,
            Miles,
            Plate_number,
            VIN,
            categoryLevel1: categoryLevel1.replaceAll(" ", ""),
            // FedExID,
            RentalLocation,
            RegistrationCopy,
            ProofOfInsurance,
            TruckPictures,
            GVWR,
        };

        if (FedExID) {
            const foundUserRes = await integrationSdk.users.query({
                pub_FedExID: Number(FedExID)
            });

            const foundUsers = foundUserRes?.data?.data;
            const foundUser = foundUsers && foundUsers[0];
            if (foundUser) {
                const {
                    deleted, banned, permissions,
                } = foundUser.attributes;

                if (deleted || banned) {
                    res.status(400).send("User is either banned or deleted.");
                } else {
                    const notAllowedToPublish = permissions.postListings == "permission/deny";
                    const listingState = notAllowedToPublish ? "pendingApproval" : "published";

                    res.status(200)
                        .set('Content-Type', 'application/transit+json')
                        .send({ success: true });

                    const {
                        country,
                        postalCode,
                        address,
                        geoLocation,
                    } = await getPlaceInfo(RentalLocation) || {};

                    const truckImagesURLs = TruckPictures.map(tp => tp.value);
                    const images = await uploadImages(truckImagesURLs);

                    const geoLocationMaybe = geoLocation ? { geolocation: new LatLng(geoLocation.lat, geoLocation.lng) } : {}
                    const params = {
                        title,
                        authorId: foundUser.id,
                        state: listingState,
                        ...geoLocationMaybe,
                        publicData: {
                            location: {
                                address,
                                building: "",
                            },
                            addressInfo: {
                                country,
                                postalCode,
                            },
                            listingType: "daily-rental",
                            transactionProcessAlias: "default-booking/release-1",
                            unitType: "day",
                            ...publicDataItems,
                        },
                        images: images.filter(image => image),
                        availabilityPlan: {
                            type: "availability-plan/time",
                            timezone: "America/Chicago",
                            entries: availabilityDays.map(ad => {
                                return {
                                    dayOfWeek: ad.value.toLowerCase().substring(0, 3),
                                    seats: 1,
                                    startTime: "00:00",
                                    endTime: "00:00"
                                }
                            })
                        },
                    };

                    // if (description) {
                    //     params.description = description;
                    // };

                    if (price) {
                        params.price = {
                            currency: "USD",
                            amount: price * 100,
                        };
                    };

                    try {
                        const listingRes = await integrationSdk.listings.create(params);
                        // res.status(200)
                        //     .set('Content-Type', 'application/transit+json')
                        //     .send(listingRes)
                    } catch (error) {
                        console.log(error);
                        // handleError(res, error);
                    };
                };
            } else {
                res.status(400).send("No user found with this FedExID.");
            };
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
