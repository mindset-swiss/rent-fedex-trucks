import React, { useState } from "react";
import { Button, Modal, SecondaryButton } from "../../../../components";
import css from './EditListingPricingForm.module.css';
import editIcon from '../../../../assets/edit.svg'
import deleteIcon from '../../../../assets/delete-red.svg'

const DiscountOptions = props => {
    const { form, values } = props

    const [dicountModalIsOpen, setDiscountModalIsOpen] = useState(false)
    const [minDays, setMinDays] = useState("")
    const [percentage, setPercentage] = useState("")
    const [index, setIndex] = useState(null)
    const addDiscountOption = () => {
        let discount = [...values?.discount, { minDays, percentage }]

        if (index || index == 0) {
            discount = values?.discount.map((e, i) => {
                if (i == index) {
                    return { minDays, percentage }
                } else {
                    return e
                }
            })
        }

        form.change('discount', discount.sort((a, b) => a.minDays - b.minDays))
        setDiscountModalIsOpen(false)
        setIndex(null)
        setMinDays("")
        setPercentage("")
    }

    const onEditDiscount = (minDays, percentage, index) => {
        setMinDays(minDays)
        setPercentage(percentage)
        setIndex(index)
        setDiscountModalIsOpen(true)
    }

    const onDeleteDiscount = (index) => {
        form.change('discount', values?.discount.filter((e, i) => i !== index))
    }

    return <div>
        <table className={css.discountTable}>
            <thead>
                <tr>
                    <th>Min Days</th>
                    <th>Discount (%)</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {values?.discount.map(({ minDays, percentage }, index) => {
                    return <tr>
                        <td>{minDays}</td>
                        <td>{percentage}</td>
                        <td>
                            <button
                                className={css.buttonIcon}
                                type="button"
                                onClick={() => onEditDiscount(minDays, percentage, index)}
                            >
                                <img src={editIcon} alt="edit" />
                            </button>
                            <button
                                className={css.buttonIcon}
                                type="button"
                                onClick={() => onDeleteDiscount(index)}
                            >
                                <img src={deleteIcon} alt="delete" />
                            </button>
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
        <SecondaryButton style={{ width: "241px" }}
            onClick={(e) => {
                e.preventDefault()
                setIndex(null)
                setMinDays("")
                setPercentage("")
                setDiscountModalIsOpen(true)
            }}
        >Add discount option</SecondaryButton>
        <Modal
            id="AddDiscountModal"
            isOpen={dicountModalIsOpen}
            onClose={() => {
                setIndex(null)
                setMinDays("")
                setPercentage("")
                setDiscountModalIsOpen(false)
            }}
            usePortal
            onManageDisableScrolling={() => { }}
            closeButtonMessage={"Close"}
        >
            <label>Minimum no of days for discount</label>
            <input type="number" className={css.input} value={minDays} onChange={(e) => setMinDays(Number(e.target.value))} />

            <label>Discount percentage</label>
            <input type="number" className={css.input} value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} />
            <Button
                disabled={!minDays || !percentage}
                onClick={addDiscountOption}
            >{index || index == 0 ? "Update" : "Add +"}</Button>
        </Modal>
    </div>
}

export default DiscountOptions