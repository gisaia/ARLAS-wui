describe('Map filter', () => {

  it('Draw geom with WKT', () => {

    // hide analytics
    cy.get('.arlas-analytics-toggle').click({ force: true });

    cy.get('.arlas-map-action-container > .mat-tooltip-trigger > .mat-icon').trigger('mouseenter');
    cy.get('.arlas-map-action-container .arlas-map-action-items:nth-child(4)').click();
    cy.get('.mat-radio-label-content').contains('WKT').click();
    cy.wait(500);

    // eslint-disable-next-line max-len
    cy.get('.mapgl-import-textxarea').invoke('val', 'POLYGON((2.369058339483616 51.031959868809295,-0.22371509801638378 49.343982197018875,-4.794027598016384 48.56486253306093,-4.442465098016384 47.89155467932282,-2.113363535516384 46.97001578866654,-1.5860197855163838 43.282279568010644,3.291909901983616 42.31496960939882,3.379800526983616 43.218262882533196,4.258706776983616 43.410111059830584,6.060464589483616 43.05792683586696,7.554605214483616 43.95039057327211,6.543863026983616 46.48806380649728,8.213784901983615 48.99920897949136,2.369058339483616 51.031959868809295))').trigger('input');
    cy.get('.mapgl-import-section .mat-checkbox').click();
    cy.get('.mapgl-import-actions .mat-button').contains('Importer').click();
  });
});
