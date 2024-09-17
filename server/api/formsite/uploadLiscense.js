const { handleError } = require('../../api-util/sdk');

const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const integrationSdk = flexIntegrationSdk.createInstance({
    clientId: process.env.SHARETRIBE_INTEGRATION_CLIENT_ID,
    clientSecret: process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET
});

module.exports = async (req, res) => {
    try {
        const FedExID = req.body.items.find(i => i.id == '1').value;
        const license = req.body.items.find(i => i.id == '0').values[0].value;

        if (FedExID) {
            const foundUserRes = await integrationSdk.users.query({
                pub_FedExID: Number(FedExID)
            });

            const foundUsers = foundUserRes?.data?.data;
            const foundUser = foundUsers && foundUsers[0];
            if (foundUser) {
                const {
                    deleted, banned,
                } = foundUser.attributes;

                if (deleted || banned) {
                    res.status(400).send("User is either banned or deleted.");
                } else {
                    const params = {
                        id: foundUser.id,
                        publicData: { drivingLicense: license },
                    };

                    try {
                        const userRes = await integrationSdk.users.updateProfile(params);
                        res.status(200)
                            .set('Content-Type', 'application/transit+json')
                            .send(userRes)
                    } catch (error) {
                        console.log(error);
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
