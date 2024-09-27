const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, handleError, serialize, fetchCommission } = require('../api-util/sdk');
const { constructValidLineItems } = require('../api-util/lineItemHelpers');
const { getProviderCommission } = require('../api-util/commissionUtils');

module.exports = (req, res) => {
  const { isOwnListing, listingId, orderData } = req.body;

  const sdk = getSdk(req, res);

  const listingPromise = () =>
    isOwnListing
      ? sdk.ownListings.show({ id: listingId })
      : sdk.listings.show({ id: listingId, include: ['author'] });

  Promise.all([listingPromise(), fetchCommission(sdk)])
    .then(([showListingResponse, fetchAssetsResponse]) => {
      const listing = showListingResponse.data.data;
      const authorType =
        showListingResponse.data?.included[0]?.attributes?.profile?.publicData?.userType;
      const commissionAsset = fetchAssetsResponse.data.data[0];
      const providerCommission = getProviderCommission(
        showListingResponse,
        authorType,
        commissionAsset
      );

      const { customerCommission } =
        commissionAsset?.type === 'jsonAsset' ? commissionAsset.attributes.data : {};

      // const { providerCommission, customerCommission } =
      //   commissionAsset?.type === 'jsonAsset' ? commissionAsset.attributes.data : {};

      const lineItems = transactionLineItems(
        listing,
        orderData,
        providerCommission,
        customerCommission
      );

      // Because we are using returned lineItems directly in this template we need to use the helper function
      // to add some attributes like lineTotal and reversal that Marketplace API also adds to the response.
      const validLineItems = constructValidLineItems(lineItems);

      res
        .status(200)
        .set('Content-Type', 'application/transit+json')
        .send(serialize({ data: validLineItems }))
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
