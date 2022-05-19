describe('Analytics', () => {

  it('Donut', () => {

    // move collection group up
    cy.get('#mat-expansion-panel-header-1')
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { clientY: -200 })
      .trigger('mouseup', { force: true });

    cy.wait(500);
    cy.get('#svgix .donut__arc--container > :nth-child(7)').click({ force: true });
    cy.wait(2000);

    // assert the value
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('4 545');
    });

  });
});
