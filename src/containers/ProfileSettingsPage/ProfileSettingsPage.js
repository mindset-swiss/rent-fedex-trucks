import React from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { PROFILE_PAGE_PENDING_APPROVAL_VARIANT } from '../../util/urlHelpers';
import { ensureCurrentUser } from '../../util/data';
import {
  initialValuesForUserFields,
  isUserAuthorized,
  pickUserFieldsData,
} from '../../util/userHelpers';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import {
  H3,
  H4,
  Page,
  UserNav,
  NamedLink,
  LayoutSingleColumn,
  ExternalLink,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ProfileSettingsForm from './ProfileSettingsForm/ProfileSettingsForm';

import { updateProfile, uploadImage } from './ProfileSettingsPage.duck';
import css from './ProfileSettingsPage.module.css';

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

const ViewProfileLink = props => {
  const { userUUID, isUnauthorizedUser } = props;
  return userUUID && isUnauthorizedUser ? (
    <NamedLink
      className={css.profileLink}
      name="ProfilePageVariant"
      params={{ id: userUUID, variant: PROFILE_PAGE_PENDING_APPROVAL_VARIANT }}
    >
      <FormattedMessage id="ProfileSettingsPage.viewProfileLink" />
    </NamedLink>
  ) : userUUID ? (
    <NamedLink className={css.profileLink} name="ProfilePage" params={{ id: userUUID }}>
      <FormattedMessage id="ProfileSettingsPage.viewProfileLink" />
    </NamedLink>
  ) : null;
};

export const ProfileSettingsPageComponent = props => {
  const config = useConfiguration();
  const {
    currentUser,
    image,
    onImageUpload,
    onUpdateProfile,
    scrollingDisabled,
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
    intl,
  } = props;

  const { userFields, userTypes = [] } = config.user;

  const handleSubmit = (values, userType) => {
    const { firstName, lastName, displayName, bio: rawBio, ...rest } = values;

    const displayNameMaybe = displayName
      ? { displayName: displayName.trim() }
      : { displayName: null };

    // Ensure that the optional bio is a string
    const bio = rawBio || '';

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...displayNameMaybe,
      bio,
      publicData: {
        ...pickUserFieldsData(rest, 'public', userType, userFields),
      },
      protectedData: {
        ...pickUserFieldsData(rest, 'protected', userType, userFields),
      },
      privateData: {
        ...pickUserFieldsData(rest, 'private', userType, userFields),
      },
    };
    const uploadedImage = props.image;

    // Update profileImage only if file system has been accessed
    const updatedValues =
      uploadedImage && uploadedImage.imageId && uploadedImage.file
        ? { ...profile, profileImageId: uploadedImage.imageId }
        : profile;

    onUpdateProfile(updatedValues);
  };

  const user = ensureCurrentUser(currentUser);
  const {
    firstName,
    lastName,
    displayName,
    bio,
    publicData,
    protectedData,
    privateData,
  } = user?.attributes.profile;
  // I.e. the status is active, not pending-approval or banned
  const isUnauthorizedUser = currentUser && !isUserAuthorized(currentUser);

  const { userType, FedExID, drivingLicense, insurance, fedExIdUpload } = publicData || {};
  const profileImageId = user.profileImage ? user.profileImage.id : null;
  const profileImage = image || { imageId: profileImageId };
  const userTypeConfig = userTypes.find(config => config.userType === userType);
  const isDisplayNameIncluded = userTypeConfig?.defaultUserFields?.displayName !== false;
  // ProfileSettingsForm decides if it's allowed to show the input field.
  const displayNameMaybe = isDisplayNameIncluded && displayName ? { displayName } : {};

  const profileSettingsForm = user.id ? (
    <ProfileSettingsForm
      className={css.form}
      currentUser={currentUser}
      initialValues={{
        firstName,
        lastName,
        ...displayNameMaybe,
        bio,
        profileImage: user.profileImage,
        ...initialValuesForUserFields(publicData, 'public', userType, userFields),
        ...initialValuesForUserFields(protectedData, 'protected', userType, userFields),
        ...initialValuesForUserFields(privateData, 'private', userType, userFields),
      }}
      profileImage={profileImage}
      onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
      uploadInProgress={uploadInProgress}
      updateInProgress={updateInProgress}
      uploadImageError={uploadImageError}
      updateProfileError={updateProfileError}
      onSubmit={values => handleSubmit(values, userType)}
      marketplaceName={config.marketplaceName}
      userFields={userFields}
      userTypeConfig={userTypeConfig}
    />
  ) : null;

  const uploadLicenseContainer = <div className={css.uploadLicenseContainer}>
    <H4 as="h2">
      <FormattedMessage id="ProfileSettingsPage.uploadLicenseTitle" />
    </H4>

    <div className={css.licenseActions}>
      {drivingLicense ? <ExternalLink href={drivingLicense}>
        <FormattedMessage id="ProfileSettingsPage.viewLicensButton" />
      </ExternalLink> : null}

      <ExternalLink
        target="_self"
        href={`https://fs10.formsite.com/tKj6Xo/kytrnfzztu/fill?id1=${FedExID}`}
      >
        <FormattedMessage id={drivingLicense ? "ProfileSettingsPage.reuploadLicensButton" : "ProfileSettingsPage.uploadLicensButton"} />
      </ExternalLink>
    </div>
  </div>;

  const uploadInsuranceContainer = <div className={css.uploadLicenseContainer}>
    <H4 as="h2">
      <FormattedMessage id="ProfileSettingsPage.uploadInsuranceTitle" />
    </H4>

    <div className={css.licenseActions}>
      {insurance ? <ExternalLink href={insurance}>
        <FormattedMessage id="ProfileSettingsPage.viewInsuranceButton" />
      </ExternalLink> : null}

      <ExternalLink
        target="_self"
        href={`https://fs10.formsite.com/tKj6Xo/6mdvyvznco/fill?id1=${FedExID}`}
      >
        <FormattedMessage id={insurance ? "ProfileSettingsPage.reuploadInsuranceButton" : "ProfileSettingsPage.uploadInsuranceButton"} />
      </ExternalLink>
    </div>
  </div>;

  const uploadFedExIdContainer = <div className={css.uploadLicenseContainer}>
    <H4 as="h2">
      <FormattedMessage id="ProfileSettingsPage.uploadFedExIdTitle" />
    </H4>

    <div className={css.licenseActions}>
      {fedExIdUpload ? <ExternalLink href={fedExIdUpload}>
        <FormattedMessage id="ProfileSettingsPage.viewFedExIdButton" />
      </ExternalLink> : null}

      <ExternalLink
        target="_self"
        href={`https://fs10.formsite.com/tKj6Xo/ysmoxw3fnh/fill?id1=${FedExID}`}
      >
        <FormattedMessage id={fedExIdUpload ? "ProfileSettingsPage.reuploadFedExIdButton" : "ProfileSettingsPage.uploadFedExIdButton"} />
      </ExternalLink>
    </div>
  </div>;

  const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer />
            <UserNav currentPage="ProfileSettingsPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <div className={css.headingContainer}>
            <H3 as="h1" className={css.heading}>
              <FormattedMessage id="ProfileSettingsPage.heading" />
            </H3>

            <ViewProfileLink userUUID={user?.id?.uuid} isUnauthorizedUser={isUnauthorizedUser} />
          </div>
          {profileSettingsForm}
          {uploadLicenseContainer}
          {uploadInsuranceContainer}
          {process.env.REACT_APP_SHOW_FEDEXID_UPLOAD == 'true' && uploadFedExIdContainer}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

ProfileSettingsPageComponent.defaultProps = {
  currentUser: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
  config: null,
};

ProfileSettingsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  image: shape({
    id: string,
    imageId: propTypes.uuid,
    file: object,
    uploadedImage: propTypes.image,
  }),
  onImageUpload: func.isRequired,
  onUpdateProfile: func.isRequired,
  scrollingDisabled: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,

  // from useConfiguration()
  config: object,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
  } = state.ProfileSettingsPage;
  return {
    currentUser,
    image,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
});

const ProfileSettingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ProfileSettingsPageComponent);

export default ProfileSettingsPage;
