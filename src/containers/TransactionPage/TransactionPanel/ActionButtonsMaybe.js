import React, { useState } from 'react';
import classNames from 'classnames';

import { Modal, PrimaryButton, SecondaryButton } from '../../../components';

import css from './TransactionPanel.module.css';

// Functional component as a helper to build ActionButtons
const ActionButtonsMaybe = props => {
  const {
    className,
    rootClassName,
    showButtons,
    primaryButtonProps,
    secondaryButtonProps,
    isListingDeleted,
    isProvider,
    transaction,
  } = props;

  const [showBookingDetails, setShowBookingDetails] = useState(false)

  // In default processes default processes need special handling
  // Booking: provider should not be able to accept on-going transactions
  // Product: customer should be able to dispute etc. on-going transactions
  if (isListingDeleted && isProvider) {
    return null;
  }

  const buttonsDisabled = primaryButtonProps?.inProgress || secondaryButtonProps?.inProgress;

  const startRentalHasBeenFilled = transaction?.attributes.metadata["Start Rental"]

  const primaryButton = primaryButtonProps && (primaryButtonProps?.defaultHidden ? startRentalHasBeenFilled : true) ? (
    <PrimaryButton
      inProgress={primaryButtonProps.inProgress}
      disabled={buttonsDisabled}
      onClick={() => {
        primaryButtonProps.startEndForm && startRentalHasBeenFilled ? setShowBookingDetails("Start Rental") : primaryButtonProps.onAction()
      }}
    >
      {startRentalHasBeenFilled ? "View Start Form" : primaryButtonProps.buttonText}
    </PrimaryButton>
  ) : null;
  const primaryErrorMessage = primaryButtonProps?.error ? (
    <p className={css.actionError}>{primaryButtonProps?.errorText}</p>
  ) : null;
  const endRentalHasBeenFilled = transaction?.attributes.metadata["End Rental"]

  const secondaryButton = secondaryButtonProps && (secondaryButtonProps?.defaultHidden ? endRentalHasBeenFilled : true) ? (
    <SecondaryButton
      inProgress={secondaryButtonProps?.inProgress}
      disabled={buttonsDisabled}
      onClick={() => {
        secondaryButtonProps.startEndForm && endRentalHasBeenFilled ? setShowBookingDetails("End Rental") : secondaryButtonProps.onAction()
      }}
    >
      {endRentalHasBeenFilled ? "View End Form" : secondaryButtonProps.buttonText}
    </SecondaryButton>
  ) : null;
  const secondaryErrorMessage = secondaryButtonProps?.error ? (
    <p className={css.actionError}>{secondaryButtonProps?.errorText}</p>
  ) : null;

  const classes = classNames(rootClassName || css.actionButtons, className);

  const bookingDetails = transaction?.attributes.metadata[showBookingDetails]

  return showButtons ? (
    <div className={classes}>
      <div className={css.actionErrors}>
        {primaryErrorMessage}
        {secondaryErrorMessage}
      </div>
      <div className={css.actionButtonWrapper}>
        {secondaryButton}
        {primaryButton}
      </div>
      <Modal
        id="confirmCloseModal"
        isOpen={showBookingDetails}
        onClose={() => setShowBookingDetails(false)}
        closeButtonMessage={"Close"}
        onManageDisableScrolling={() => { }}
        usePortal
      >
        <div>
          <h3>{showBookingDetails} Details</h3>
          <p>
            <strong>Date</strong>
            <br></br>
            {bookingDetails?.date}
          </p>

          <p>
            <strong>Driver's Name</strong>
            <br></br>
            {bookingDetails?.driverName}
          </p>
          <p>
            <strong>Mileage of the vehicle</strong>
            <br></br>
            {bookingDetails?.mileage}
          </p>
          <p>
            <strong>Fuel level of the vehicle (%)</strong>
            <br></br>
            {bookingDetails?.fuelLevel}
          </p>
          <p>
            <strong>Any damages or issues observed on the vehicle? Please describe.</strong>
            <br></br>
            {bookingDetails?.issuesOrDamage}
          </p>
          <p>
            <strong>Was the vehicle returned in the same condition as when rented?</strong>
            <br></br>
            {bookingDetails?.conditionAfterRental}
          </p>
          <p>
            <strong>Is the vehicle able to be rented again in its current condition?</strong>
            <br></br>
            {bookingDetails?.currentCondition}
          </p>
          <p>
            <strong>Additional comments or notes</strong>
            <br></br>
            {bookingDetails?.additionalComments}
          </p>
          <p>
            <strong>Exterior Photos</strong>
            <br></br>
            {bookingDetails?.exteriorPhotos.map(({ value }, index) => <div>
              <a href={value} target='_blank'>Photo {index + 1}</a><br></br>
            </div>)}
          </p>
          <p>
            <strong>Odometer Photos</strong>
            <br></br>
            {bookingDetails?.odoMeterPhotos.map(({ value }, index) => <div>
              <a href={value} target='_blank'>Photo {index + 1}</a><br></br>
            </div>)}
          </p>
        </div>
      </Modal>
    </div>
  ) : null;
};

export default ActionButtonsMaybe;
