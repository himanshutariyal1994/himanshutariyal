@isTest
private class ManageQuoteCtlrTest {
  @TestSetup
  static void makeData() {
    Date todayDate = Date.today();
    Quote__c q = new Quote__c(
      StartDate__c = todayDate,
      EndDate__c = todayDate.addDays(10),
      TotalQuotedAmount__c = null
    );
    insert q;
  }

  @isTest
  static void getQuoteDetailsTest() {
    Quote__c q = [SELECT Id FROM Quote__c WHERE StartDate__c = TODAY LIMIT 1];

    Test.startTest();
    QuoteDto qDto = ManageQuoteCtlr.getQuoteDetails(q.Id);
    Test.stopTest();

    System.assertEquals(
      Date.today(),
      qDto.startDate,
      'Start Date of the quote record is incorrect'
    );
  }

  @isTest
  static void updateQuoteDetailsTest() {
    Quote__c q = [
      SELECT Id, Name, StartDate__c, EndDate__c, TotalQuotedAmount__c
      FROM Quote__c
      WHERE StartDate__c = TODAY
      LIMIT 1
    ];
    Date futureDate = Date.today().addDays(100);

    Test.startTest();

    QuoteDto qDto = new QuoteDto(q);
    qDto.endDate = futureDate;
    qDto.totalQuoteAmount = 10000;
    ManageQuoteCtlr.updateQuoteDetails(qDto);

    Test.stopTest();

    q = [
      SELECT Id, Name, StartDate__c, EndDate__c, TotalQuotedAmount__c
      FROM Quote__c
      WHERE Id = :q.Id
      LIMIT 1
    ];
    System.assertEquals(
      10000,
      q.TotalQuotedAmount__c,
      'Total quoted amount is not updated'
    );
    System.assertEquals(futureDate, q.EndDate__c, 'End Date is not updated');
  }
}
