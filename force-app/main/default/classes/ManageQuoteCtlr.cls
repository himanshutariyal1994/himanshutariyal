public with sharing class ManageQuoteCtlr {
  @AuraEnabled(cacheable=true)
  public static QuoteDto getQuoteDetails(Id recordId) {
    try {
      Quote__c quote = [
        SELECT Name, StartDate__c, EndDate__c, TotalQuotedAmount__c
        FROM Quote__c
        WHERE Id = :recordId
        WITH SECURITY_ENFORCED
        LIMIT 1
      ];
      QuoteDto quoteDtoInst = new QuoteDto(quote);
      return quoteDtoInst;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static void updateQuoteDetails(QuoteDto quoteDto) {
    try {
      Quote__c quote = createQuoteFromQuoteDtoInst(quoteDto);

      // Perform security check to strip inaccessible fields
      SObjectAccessDecision securityDecision = Security.stripInaccessible(
        AccessType.UPDATABLE,
        new List<Quote__c>{ quote }
      );
      update securityDecision.getRecords();
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  public static Quote__c createQuoteFromQuoteDtoInst(QuoteDto quoteDto) {
    Quote__c quote = new Quote__c();
    quote.Id = quoteDto.id;
    quote.StartDate__c = quoteDto.startDate;
    quote.EndDate__c = quoteDto.endDate;
    quote.TotalQuotedAmount__c = quoteDto.totalQuoteAmount;
    return quote;
  }
}
