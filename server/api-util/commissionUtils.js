const getProviderCommission = (showListingResponse, authorType, commissionAsset) => {
  const commissionFromMetadata =
    showListingResponse.data?.included[0]?.attributes?.profile?.metadata?.commission;

  if (commissionFromMetadata) {
    return { percentage: Number(commissionFromMetadata) };
  }

  if (!commissionFromMetadata && authorType === 'providerv') {
    return { percentage: Number(process.env.REACT_APP_PROVERDERV_COMMISSION) };
  }
  return { percentage: Number(commissionAsset.attributes.data.providerCommission.percentage) };
};

module.exports = { getProviderCommission };
