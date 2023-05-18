public with sharing class QuoteDto extends BaseDto {
  @AuraEnabled
  public Id id { get; set; }

  @AuraEnabled
  public String name { get; set; }

  @AuraEnabled
  public Date startDate { get; set; }

  @AuraEnabled
  public Date endDate { get; set; }

  @AuraEnabled
  public Double totalQuoteAmount { get; set; }

  public QuoteDto() {
  }

  public QuoteDto(Quote__c quote) {
    super(quote);
    this.id = quote.Id;
    this.name = quote.Name;
    this.startDate = quote.StartDate__c;
    this.endDate = quote.EndDate__c;
    this.totalQuoteAmount = quote.TotalQuotedAmount__c;
  }

  public override SObject refreshSo() {
    return null;
  }
}
