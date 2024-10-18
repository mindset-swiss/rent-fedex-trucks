import React from 'react';

// Utils
import { SCHEMA_TYPE_MULTI_ENUM, SCHEMA_TYPE_TEXT } from '../../util/types';
import {
  isFieldForCategory,
  pickCategoryFields,
  pickCustomFieldProps,
} from '../../util/fieldHelpers.js';

import SectionDetailsMaybe from './SectionDetailsMaybe';
import SectionMultiEnumMaybe from './SectionMultiEnumMaybe';
import SectionTextMaybe from './SectionTextMaybe';

import css from './ListingPage.module.css';

/**
 * Renders custom listing fields.
 * - SectionDetailsMaybe is used if schemaType is 'enum', 'long', or 'boolean'
 * - SectionMultiEnumMaybe is used if schemaType is 'multi-enum'
 * - SectionTextMaybe is used if schemaType is 'text'
 *
 * @param {*} props include publicData, metadata, listingFieldConfigs, categoryConfiguration
 * @returns React.Fragment containing aforementioned components
 */
const CustomListingFields = props => {
  const { publicData, metadata, listingFieldConfigs, categoryConfiguration } = props;

  const { key: categoryPrefix, categories: listingCategoriesConfig } = categoryConfiguration;
  const categoriesObj = pickCategoryFields(publicData, categoryPrefix, 1, listingCategoriesConfig);
  const currentCategories = Object.values(categoriesObj);

  const isFieldForSelectedCategories = fieldConfig => {
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig);
    return isTargetCategory;
  };
  const propsForCustomFields =
    pickCustomFieldProps(
      publicData,
      metadata,
      listingFieldConfigs,
      'listingType',
      isFieldForSelectedCategories
    ) || [];

  return (
    <>
      <section className={css.sectionText}>
        {publicData ? (
          <ul className={css.details}>
            {['year', 'Make', 'Model', 'Box_length', 'GVWR', 'Miles', 'Miles2', 'ForSalePrice', 'extras'].map(
              key =>
                publicData[key] && (
                  <li key={key} className={css.detailsRow}>
                    <span className={css.detailLabel}>
                      {key == "ForSalePrice" ? "Selling Price (USD)" : key.charAt(0).toUpperCase() + key.replaceAll("_", " ").slice(1)}
                    </span>
                    <span>{publicData[key]}</span>
                  </li>
                )
            )}
          </ul>
        ) : null}
      </section>

      {/* <SectionDetailsMaybe {...props} isFieldForCategory={isFieldForSelectedCategories} />
      {propsForCustomFields.map(customFieldProps => {
        const { schemaType, ...fieldProps } = customFieldProps;
        return schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
          <SectionMultiEnumMaybe {...fieldProps} />
        ) : schemaType === SCHEMA_TYPE_TEXT ? (
          <SectionTextMaybe {...fieldProps} />
        ) : null;
      })} */}
    </>
  );
};

export default CustomListingFields;
