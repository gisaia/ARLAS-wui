describe('Analytics', () => {

  it('Donut', () => {

    // hide analytics
    cy.get('#svgix .donut__arc--container > :nth-child(7)').click({force: true});
    cy.wait(2000);

  });
});
