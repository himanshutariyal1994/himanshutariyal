/*
 * Provus Services Quoting
 * Copyright (c) 2023 Provus Inc. All rights reserved.
 */

import { LightningElement, api } from "lwc";

import ADJUST_QUOTE from "@salesforce/label/c.Adjust_Quote";
import QUOTE_ADJUSTED_AMOUNT from "@salesforce/label/c.Quote_Adjusted_Amount";

export default class QuoteTotalSummary extends LightningElement {
  @api recordId;

  label = {
    adjustQuote: ADJUST_QUOTE,
    quoteAdjustedAmount: QUOTE_ADJUSTED_AMOUNT
  };

  /* Handler methods */
  handleAdjustQuoteClick() {
    this.template.querySelector("c-adjust-quote-price").showAdjustAmountModal();
  }
}
