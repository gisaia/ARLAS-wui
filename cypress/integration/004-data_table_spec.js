describe('Data table', () => {
  it('table order', () => {
    cy.get('.side-result-list-toggle').click();
    cy.wait(2000);
    cy.get('#resultlist_sort .mat-select').click();

    cy.get('.resultlist__tools--sort-group .mat-option').contains('Date').click();

    cy.get('#1000858886690323 > :nth-child(4)')
      .should(elem => {
        expect(elem.text().trim()).to.equal('0%');
      });
  });
});
