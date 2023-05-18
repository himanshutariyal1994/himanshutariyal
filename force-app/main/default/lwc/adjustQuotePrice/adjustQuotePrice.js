/*
 * Provus Services Quoting
 * Copyright (c) 2023 Provus Inc. All rights reserved.
 */

import { LightningElement, api, wire, track } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { notifyRecordUpdateAvailable } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getQuoteDetails from "@salesforce/apex/ManageQuoteCtlr.getQuoteDetails";
import updateQuoteDetails from "@salesforce/apex/ManageQuoteCtlr.updateQuoteDetails";

import ADJUSTED_AMOUNT from "@salesforce/label/c.Adjusted_Amount";
import CLOSE from "@salesforce/label/c.Close";
import CANCEL from "@salesforce/label/c.Cancel";
import ADJUST_QUOTE_PRICE from "@salesforce/label/c.Adjust_Quote_Price";
import NO_QUOTE_FOUND from "@salesforce/label/c.No_Quote_Found";
import ERROR_OCCURED from "@salesforce/label/c.Error_Occured";
import VALIDATION_ISSUE from "@salesforce/label/c.Field_Validation_Issue";
import QUOTE_AMOUNT_REQUIRED from "@salesforce/label/c.Amount_is_Required_Field";
import SAVE from "@salesforce/label/c.Save";
import SUCCESS_TOAST from "@salesforce/label/c.Success_Toast";
import QUOTE_SAVED from "@salesforce/label/c.Quote_Saved";

export default class AdjustQuotePrice extends LightningElement {
  @api recordId;
  @track quoteData = {};
  isLoading = false;
  showModal = false;
  label = {
    adjustedAmount: ADJUSTED_AMOUNT,
    close: CLOSE,
    cancel: CANCEL,
    save: SAVE,
    adjustQuotePrice: ADJUST_QUOTE_PRICE,
    errorOccured: ERROR_OCCURED,
    validationIssue: VALIDATION_ISSUE,
    noQuoteFound: NO_QUOTE_FOUND,
    validationIssueLabel: QUOTE_AMOUNT_REQUIRED,
    successToast: SUCCESS_TOAST,
    quoteSavedMsg: QUOTE_SAVED
  };
  adjustedAmount = 0;

  get quoteDataFetched() {
    return this.quoteData && Object.keys(this.quoteData).length > 0;
  }

  // Wire method to fetch the Quote details from record id
  _quoteDetails;
  @wire(getQuoteDetails, { recordId: "$recordId" })
  wiredQuoteData(value) {
    this._quoteDetails = value;
    const { data, error } = value;

    if (data) {
      this.quoteData = data;
    } else if (error) {
      console.error(error);

      this.showToast({
        title: this.label.errorOccured,
        message: error?.message || error?.body?.message || error,
        variant: "error"
      });
    }
  }

  /* Handler and utility methods */
  @api
  showAdjustAmountModal() {
    this.showModal = true;
  }

  hideModal() {
    this.showModal = false;
  }

  handleQuoteAmountChange(event) {
    this.quoteData = {
      ...this.quoteData,
      totalQuoteAmount: event.detail.value ? parseFloat(event.detail.value) : 0
    };
  }

  handleSaveAdjustedAmount() {
    // Show spinner
    this.toggleLoading();

    // Check for empty fields in the Quote layout
    const allValid = [
      ...this.template.querySelectorAll("lightning-input")
    ].reduce((validSoFar, inputFields) => {
      inputFields.reportValidity();
      return validSoFar && inputFields.checkValidity();
    }, true);

    // Show toast if any field restriction is found
    if (!allValid) {
      this.toggleLoading();
      this.showToast({
        title: this.label.validationIssue,
        message: this.label.validationIssueLabel,
        variant: "error",
        mode: "dismissable"
      });
      return;
    }

    // Call the imperative method to save Quote details
    this.updateQuoteDetailsInSF();
  }

  updateQuoteDetailsInSF() {
    // Update the Quote details
    updateQuoteDetails({
      quoteDto: this.quoteData
    })
      .then(() => {
        // Refresh the wire adapter to get latest details
        refreshApex(this._quoteDetails);
        notifyRecordUpdateAvailable([{ recordId: this.recordId }]);

        // Show toast indicating that quote was saved
        this.showToast({
          title: this.label.successToast,
          message: this.label.quoteSavedMsg,
          variant: "success"
        });

        // Hide the modal
        this.hideModal();
      })
      .catch((e) => {
        this.showToast({
          title: this.label.errorOccured,
          message: e.message || e.body.message || e,
          variant: "error"
        });
      })
      .finally(() => {
        this.toggleLoading();
      });
  }

  showToast(showToastObj) {
    const { title, message, variant, mode } = showToastObj;
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: mode
    });
    this.dispatchEvent(event);
  }

  toggleLoading() {
    this.isLoading = !this.isLoading;
  }
}
