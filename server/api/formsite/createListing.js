const { handleError } = require('../../api-util/sdk');
const { types } = require('sharetribe-flex-sdk');
const { LatLng } = types;

module.exports = async (req, res) => {
    try {
        const {
            FedExID,
            title,
            description,
            price,
            ...restOfFields
        } = req.body;

        const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
        const integrationSdk = flexIntegrationSdk.createInstance({
            clientId: process.env.SHARETRIBE_INTEGRATION_CLIENT_ID,
            clientSecret: process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET
        });

        if (FedExID && title) {
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
                            ...restOfFields,
                        },
                    };

                    if (description) {
                        params.description = description;
                    };

                    if (price) {
                        params.price = {
                            currency: "USD",
                            amount: price,
                        };
                    };

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
            res.status(400).send("Either 'FedExID' or listing 'title' was not provided.");
        };

    } catch (err) {
        handleError(res, err);
    };
};
