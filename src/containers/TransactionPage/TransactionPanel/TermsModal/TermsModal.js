import React, { useState, useRef } from 'react';
import { FormattedMessage } from '../../../../util/reactIntl';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { FormatDateToUS } from '../../../../util/misc';
import { formatMoney } from '../../../../util/currency';
import { Modal, PrimaryButton } from '../../../../components';
import css from './TermsModal.module.css';

const { Money } = sdkTypes;

const printModalContent = (ref) => {
    let w = window.open();
    w.document.write(ref.current.innerHTML);
    w.print();
    w.close();
};

const TermsModal = (props) => {
    const {
        onManageDisableScrolling,
        intl,
        listing,
        customer,
        provider,
        txId,
        booking,
        txAttributes,
    } = props;

    const modalBodyRef = useRef(null);

    const customerDisplayName = customer?.attributes?.profile?.displayName;
    const providerDisplayName = provider?.attributes?.profile?.displayName;

    const {
        geolocation,
        publicData,
        price,
        title,
    } = listing?.attributes || {};

    const {
        Box_length,
        GVWR,
        Make,
        Miles,
        Model,
        categoryLevel1,
        year,
        address = "Test address",
    } = publicData || {};

    const {
        createdAt,
        payinTotal,
        payoutTotal,
    } = txAttributes || {};

    const { start, end } = booking || {};

    const [isOpen, setIsOpen] = useState(false);

    return <div className={css.root}>
        <a onClick={() => setIsOpen(true)}>
            <FormattedMessage id="TermsModal.openLink" />
        </a>

        <Modal
            id="TermsModal"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            usePortal
            onManageDisableScrolling={onManageDisableScrolling}
        >
            <PrimaryButton
                className={css.printButton}
                type="button"
                onClick={() => printModalContent(modalBodyRef)}
            >
                <FormattedMessage id="TermsModal.printButton" />
            </PrimaryButton>

            <div ref={modalBodyRef}>
                <h3>
                    <FormattedMessage id="TermsModal.header.title1" />
                </h3>
                <p>
                    <FormattedMessage id="TermsModal.header.text1" />
                </p>

                <h3>
                    <FormattedMessage id="TermsModal.header.title2" />
                </h3>
                <ul>
                    <li className={css.listItem}>
                        <FormattedMessage id="TermsModal.header.text2.1" />
                    </li>
                    <li className={css.listItem}>
                        <FormattedMessage id="TermsModal.header.text2.2" />
                    </li>
                    <li className={css.listItem}>
                        <FormattedMessage id="TermsModal.header.text2.3" />
                    </li>
                </ul>

                <h3>
                    <FormattedMessage id="TermsModal.header.title3" />
                </h3>
                <p>
                    <FormattedMessage id="TermsModal.header.text3" />
                </p>

                <h4>
                    <FormattedMessage id="TermsModal.header.title4" />
                </h4>
                <p>
                    <FormattedMessage id="TermsModal.header.text4" />
                </p>

                <h2>
                    <FormattedMessage
                        id="TermsModal.mainTitle"
                        values={{
                            customerDisplayName,
                            providerDisplayName,
                            Make,
                            Model,
                        }}
                    />
                </h2>

                {/* <h4>PROTECTION PLAN</h4>
            <p>$3,000</p> */}

                <h4>
                    <FormattedMessage id="TermsModal.body.outOfPocket" />
                </h4>
                <p>{formatMoney(intl, payinTotal || new Money(0, "USD"))}</p>

                {/* <h4>LIABILITY COVERAGE</h4>
            <p>State minimum liability insurance</p> */}

                <hr />

                <h4>
                    <FormattedMessage id="TermsModal.body.bookedOn" />
                </h4>
                <p>{FormatDateToUS(createdAt)}</p>

                <h4>
                    <FormattedMessage id="TermsModal.body.txId" />
                </h4>
                <p>{txId.uuid}</p>

                <hr />

                <h4>
                    <FormattedMessage id="TermsModal.body.vehicle" />
                </h4>
                <p>{Make} {Model} {year}</p>

                <h4>
                    <FormattedMessage id="TermsModal.body.boxLength" />
                </h4>
                <p>{Box_length}</p>

                <h4>
                    <FormattedMessage id="TermsModal.body.gvwr" />
                </h4>
                <p>{GVWR}</p>

                <h4>
                    <FormattedMessage id="TermsModal.body.host" />
                </h4>
                <p>{providerDisplayName}</p>

                {/* <h4>LICENSE PLATE</h4>
            <p>CJH882</p> */}

                <hr />

                <h4>
                    <FormattedMessage id="TermsModal.body.tripStart" />
                </h4>
                <p>{FormatDateToUS(start)}</p>

                <h4>
                    <FormattedMessage id="TermsModal.body.tripEnd" />
                </h4>
                <p>{FormatDateToUS(end)}</p>

                <h4>
                    <FormattedMessage id="TermsModal.body.pickupLocation" />
                </h4>
                <p>{address}</p>

                <h4>
                    <FormattedMessage id="TermsModal.body.returnLocation" />
                </h4>
                <p>{address}</p>

                <hr />

                <h4>
                    <FormattedMessage id="TermsModal.body.primaryDriver" />
                </h4>
                <p>{providerDisplayName}</p>

                <hr />

                <h4>
                    <FormattedMessage id="TermsModal.body.miles" />
                </h4>
                <p>{Miles}</p>

                <hr />

                <p>
                    <FormattedMessage id="TermsModal.body.p1" />
                </p>

                <p>
                    <FormattedMessage id="TermsModal.body.p2" />
                </p>

                <h3>
                    <FormattedMessage id="TermsModal.footer.title1" />
                </h3>
                <p>
                    <FormattedMessage id="TermsModal.footer.text1" />
                </p>

                <h3>
                    <FormattedMessage id="TermsModal.footer.title2" />
                </h3>
                <p>
                    <FormattedMessage id="TermsModal.footer.text2" />
                </p>

                <h3>
                    <FormattedMessage id="TermsModal.footer.title3" />
                </h3>
                <p>
                    <FormattedMessage id="TermsModal.footer.text3" />
                </p>
            </div>
        </Modal>
    </div>
};

export default TermsModal;
