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

import START_DATE from "@salesforce/label/c.Start_Date";
import END_DATE from "@salesforce/label/c.End_Date";
import SAVE from "@salesforce/label/c.Save";
import NO_QUOTE_FOUND from "@salesforce/label/c.No_Quote_Found";
import ERROR_OCCURED from "@salesforce/label/c.Error_Occured";
import VALIDATION_ISSUE from "@salesforce/label/c.Field_Validation_Issue";
import QUOTE_DATES_VALIDATION from "@salesforce/label/c.Quote_Dates_Validation";
import QUOTE_DATES_REQUIRED from "@salesforce/label/c.Quote_Dates_required";
import SUCCESS_TOAST from "@salesforce/label/c.Success_Toast";
import QUOTE_SAVED from "@salesforce/label/c.Quote_Saved";

export default class EditQuote extends LightningElement {
  @api recordId;
  @track quoteData = {};
  isLoading = false;

  get quoteDataFetched() {
    return this.quoteData && Object.keys(this.quoteData).length > 0;
  }
  get quoteHeader() {
    return `Welcome to quote ${this.quoteData.name}!`;
  }

  label = {
    startDate: START_DATE,
    endDate: END_DATE,
    save: SAVE,
    noQuoteFound: NO_QUOTE_FOUND,
    errorOccured: ERROR_OCCURED,
    validationIssue: VALIDATION_ISSUE,
    validationIssueLabel: QUOTE_DATES_REQUIRED,
    startDateGreaterThanEndDate: QUOTE_DATES_VALIDATION,
    successToast: SUCCESS_TOAST,
    quoteSavedMsg: QUOTE_SAVED
  };

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

  /* Handler methods */
  handleStartDateChange(event) {
    this.quoteData = { ...this.quoteData, startDate: event.detail.value };
  }

  handleEndDateChange(event) {
    this.quoteData = { ...this.quoteData, endDate: event.detail.value };
  }

  handleSaveQuote() {
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

    // Check if Start Date is greater than End Date
    if (this.quoteData.startDate > this.quoteData.endDate) {
      this.toggleLoading();
      this.showToast({
        title: this.label.validationIssue,
        message: this.label.startDateGreaterThanEndDate,
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
