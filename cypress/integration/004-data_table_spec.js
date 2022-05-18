describe('Data table', () => {
  it('table order', () => {
    cy.get('.side-result-list-toggle')
      .click();
    cy.get('#resultlist_sort .mat-select').click();
    cy.get('.resultlist__tools--sort-group .mat-option').contains('Date').click();
    cy.wait(1000);
    cy.get('#SPOT5-HRG2-XS_20140521-055919-972_L1C_186-392-0_D > :nth-child(4)')
      .should(elem => {
        expect(elem.text().trim()).to.equal('0.427864%');
      });
  });
});
