import {
  TX_TRANSITION_ACTOR_CUSTOMER as CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER as PROVIDER,
  CONDITIONAL_RESOLVER_WILDCARD,
  ConditionalResolver,
} from '../../transactions/transaction';

/**
 * Get state data against booking process for TransactionPage's UI.
 * I.e. info about showing action buttons, current state etc.
 *
 * @param {*} txInfo detials about transaction
 * @param {*} processInfo  details about process
 */
export const getStateDataForBookingProcess = (txInfo, processInfo) => {
  const { transaction, transactionRole, nextTransitions } = txInfo;
  const isProviderBanned = transaction?.provider?.attributes?.banned;
  const isCustomerBanned = transaction?.provider?.attributes?.banned;
  const _ = CONDITIONAL_RESOLVER_WILDCARD;

  const {
    processName,
    processState,
    states,
    transitions,
    isCustomer,
    actionButtonProps,
    leaveReviewProps,
  } = processInfo;

  return new ConditionalResolver([processState, transactionRole])
    .cond([states.INQUIRY, CUSTOMER], () => {
      const transitionNames = Array.isArray(nextTransitions)
        ? nextTransitions.map(t => t.attributes.name)
        : [];
      const requestAfterInquiry = transitions.REQUEST_PAYMENT_AFTER_INQUIRY;
      const hasCorrectNextTransition = transitionNames.includes(requestAfterInquiry);
      const showOrderPanel = !isProviderBanned && hasCorrectNextTransition;
      return { processName, processState, showOrderPanel };
    })
    .cond([states.INQUIRY, PROVIDER], () => {
      return { processName, processState, showDetailCardHeadings: true };
    })
    .cond([states.PREAUTHORIZED, CUSTOMER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showExtraInfo: true,
        showActionButtons: true,
        primaryButtonProps: actionButtonProps(transitions.CANCEL_CUSTOMER, CUSTOMER),
      };
    })
    .cond([states.PREAUTHORIZED, PROVIDER], () => {
      const primary = isCustomerBanned ? null : actionButtonProps(transitions.ACCEPT, PROVIDER);
      const secondary = isCustomerBanned ? null : actionButtonProps(transitions.DECLINE, PROVIDER);
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showActionButtons: true,
        primaryButtonProps: primary,
        secondaryButtonProps: secondary,
      };
    })
    .cond([states.ACCEPTED, CUSTOMER], () => {
      const bookingStartDate = new Date(transaction?.booking.attributes.start)
      const currentDate = new Date()
      const noOfHoursBefore = 72

      const cancelCutoffDate = new Date(bookingStartDate.setHours(bookingStartDate.getHours() - noOfHoursBefore))
      const ableToCancel = cancelCutoffDate > currentDate

      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showActionButtons: true,
        primaryButtonProps: {
          onAction: () => {
            const formType = 1
            const url = `https://fs10.formsite.com/tKj6Xo/azkznkrtai/fill?id2=${transaction.id.uuid}&id15=${formType}`
            window.open(url, "_top")
          },
          buttonText: "Start Booking Form",
          startEndForm: true
        },
        secondaryButtonProps: ableToCancel && isCustomer ? actionButtonProps(transitions.CANCEL_CUSTOMER_2, CUSTOMER) : {
          onAction: () => {
            const formType = 2
            const url = `https://fs10.formsite.com/tKj6Xo/azkznkrtai/fill?id2=${transaction.id.uuid}&id15=${formType}`
            window.open(url, "_top")
          },
          buttonText: "End Booking Form",
          startEndForm: true
        },
      };
    })
    .cond([states.ACCEPTED, PROVIDER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showActionButtons: true,
        primaryButtonProps: {
          buttonText: "Start Booking Form",
          startEndForm: true,
          defaultHidden: true,
        },
        secondaryButtonProps: {
          buttonText: "End Booking Form",
          startEndForm: true,
          defaultHidden: true,
        },
      };
    })
    .cond([states.DELIVERED, PROVIDER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviewAsFirstLink: true,
        showActionButtons: true,
        primaryButtonProps: leaveReviewProps,
      };
    })
    .cond([states.DELIVERED, CUSTOMER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviewAsFirstLink: true,
        showActionButtons: true,
        primaryButtonProps: leaveReviewProps,
        secondaryButtonProps: {
          onAction: () => {
            const formType = 2
            const url = `https://fs10.formsite.com/tKj6Xo/azkznkrtai/fill?id2=${transaction.id.uuid}&id15=${formType}`
            window.open(url, "_top")
          },
          buttonText: "End Booking Form",
          startEndForm: true
        },
      };
    })
    .cond([states.REVIEWED_BY_PROVIDER, CUSTOMER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviewAsSecondLink: true,
        showActionButtons: true,
        primaryButtonProps: leaveReviewProps,
        secondaryButtonProps: {
          onAction: () => {
            const formType = 2
            const url = `https://fs10.formsite.com/tKj6Xo/azkznkrtai/fill?id2=${transaction.id.uuid}&id15=${formType}`
            window.open(url, "_top")
          },
          buttonText: "End Booking Form"
        },
      };
    })
    .cond([states.REVIEWED_BY_CUSTOMER, PROVIDER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviewAsSecondLink: true,
        showActionButtons: true,
        primaryButtonProps: leaveReviewProps,
      };
    })
    .cond([states.REVIEWED, _], () => {
      return { processName, processState, showDetailCardHeadings: true, showReviews: true };
    })
    .default(() => {
      // Default values for other states
      return { processName, processState, showDetailCardHeadings: true };
    })
    .resolve();
};
