describe('Timeline filter', () => {
  it('Set timeline filter', () => {
    cy.get('.arlas-date-picker-label-from')
      .click();
    cy.get('.owl-dt-control-period-button').click();
    cy.get('.owl-dt-year-2014').click();
    cy.get('.owl-dt-month-4').click();
    cy.get('td[aria-label="21 mai 2014"]').click();
    cy.get('.owl-dt-control-button').last().click();
    cy.wait(2000);
    // assert the value
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('24 843');
    });
  });
});
