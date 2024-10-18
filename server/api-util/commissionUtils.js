const getProviderCommission = (authorCommission, authorType, commissionAsset) => {
  console.log(authorCommission)
  if (authorCommission) {
    return { percentage: Number(authorCommission) };
  }

  if (!authorCommission && authorType === 'providerv') {
    return { percentage: Number(process.env.REACT_APP_PROVERDERV_COMMISSION) };
  }
  return { percentage: Number(commissionAsset.attributes.data.providerCommission.percentage) };
};

module.exports = { getProviderCommission };
