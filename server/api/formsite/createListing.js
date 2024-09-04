const { handleError } = require('../../api-util/sdk');
const { types } = require('sharetribe-flex-sdk');
const { LatLng } = types;

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
};

module.exports = async (req, res) => {
    try {
        // const {
        // FedExID,
        // title,
        // description,
        // price,
        // ...restOfFields
        // } = req.body;

        const OwnerFirstName = req.body.items.find(i => i.id == Mapper["OwnerFirstName"]).value;
        const OwnerLastName = req.body.items.find(i => i.id == Mapper["OwnerLastName"]).value;
        const CompanyName = req.body.items.find(i => i.id == Mapper["CompanyName"]).value;
        const PhoneNumber = req.body.items.find(i => i.id == Mapper["PhoneNumber"]).value;
        const year = req.body.items.find(i => i.id == Mapper["year"]).values[0].value;
        const Make = req.body.items.find(i => i.id == Mapper["Make"]).values[0].value;
        const Model = req.body.items.find(i => i.id == Mapper["Model"]).value;
        const Box_length = req.body.items.find(i => i.id == Mapper["Box_length"]).value;
        const Miles = req.body.items.find(i => i.id == Mapper["Miles"]).value;
        const Plate_number = req.body.items.find(i => i.id == Mapper["Plate_number"]).value;
        const VIN = req.body.items.find(i => i.id == Mapper["VIN"]).value;
        const categoryLevel1 = req.body.items.find(i => i.id == Mapper["categoryLevel1"]).values[0].value;
        const FedExID = req.body.items.find(i => i.id == Mapper["FedExID"]).value;
        const RentalLocation = req.body.items.find(i => i.id == Mapper["RentalLocation"]).value;
        const RegistrationCopy = req.body.items.find(i => i.id == Mapper["RegistrationCopy"]).values;
        const ProofOfInsurance = req.body.items.find(i => i.id == Mapper["ProofOfInsurance"]).values;
        const TruckPictures = req.body.items.find(i => i.id == Mapper["TruckPictures"]).values;

        const title = `${Make} ${Model} ${year}`;
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
            categoryLevel1,
            // FedExID,
            RentalLocation,
            RegistrationCopy,
            ProofOfInsurance,
            TruckPictures,
        };

        const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
        const integrationSdk = flexIntegrationSdk.createInstance({
            clientId: process.env.SHARETRIBE_INTEGRATION_CLIENT_ID,
            clientSecret: process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET
        });

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
                    res.status(400)
                        .send("User is either banned or deleted.")
                } else {
                    const notAllowedToPublish = permissions.postListings == "permission/deny";
                    const listingState = notAllowedToPublish ? "pendingApproval" : "published";

                    const params = {
                        title,
                        authorId: foundUser.id,
                        state: listingState,
                        // geolocation: new LatLng(40.64542, -74.08508),
                        publicData: {
                            // address: {
                            // city: "New York",
                            // country: "USA",
                            // state: "NY",
                            // street: "230 Hamilton Ave"
                            // },
                            listingType: "daily-rental",
                            transactionProcessAlias: "default-booking/release-1",
                            unitType: "day",
                            ...publicDataItems,
                        },
                    };

                    // if (description) {
                    //     params.description = description;
                    // };

                    // if (price) {
                    //     params.price = {
                    //         currency: "USD",
                    //         amount: price,
                    //     };
                    // };

                    try {
                        const listingRes = await integrationSdk.listings.create(params);

                        res.status(200)
                            .set('Content-Type', 'application/transit+json')
                            .send(listingRes)
                    } catch (error) {
                        handleError(res, error);
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
