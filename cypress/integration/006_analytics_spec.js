describe('Analytics', () => {

  it('Donut', () => {

    // move collection group up
    cy.get('#mat-expansion-panel-header-1')
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { clientY: -200 })
      .trigger('mouseup', { force: true });

    cy.wait(500);
    cy.get('#svgix .donut__arc--container > :nth-child(7)').click({ force: true });

    // assert the value
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('25 000');
    });

  });

  it('Powerbars', () => {

    // move collection group up
    cy.get('#mat-expansion-panel-header-1')
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { clientY: -200 })
      .trigger('mouseup', { force: true });


    cy.get('arlas-tool-widget', {timeout: 6000}).eq(3).as('powerbar');

    cy.get('@powerbar').find('.powerbars--search input').type('TerraSAR');
    cy.wait(1000);
    cy.get('@powerbar').find('.powerbar__powerbar--term').contains('Terra').click();
    cy.wait(1000);
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('25 000');
    });
    cy.wait(2000);
    cy.get('@powerbar').find('.include_exclude').children().contains('exclure').click();
    cy.wait(1000);
    cy.get('#arlas-count .value').should(elem => {
      expect(elem.text().trim()).to.equal('25 000');
    });
  });
});
