describe('Timeline filter', () => {
  it('Set timeline filter', () => {
    // get('.arlas-date-picker-label-from') => Get one or more DOM elements with css class "arlas-date-picker-label-from"
    // first() => keep only the first
    // click() => click on the selected element
    cy.get('.arlas-date-picker-label-from').first().click();
    cy.get('.owl-dt-control-period-button').click();

    // get('.owl-dt-year-2014') => Get one or more DOM elements with css class "owl-dt-year-2014"
    cy.get('.owl-dt-year-2014').click();

    // get('.owl-dt-month-4')
    cy.get('.owl-dt-month-4').click();

    // Get one or more td element with label equal to 21 mai 2014
    cy.get('td[aria-label="21 mai 2014"]').click();

    // Get one or more td element with label equal to 21 mai 2014
    cy.get('.owl-dt-control-button').last().click();

    cy.wait(2000);

    // assert the value
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('25 000');
    });
  });
});
