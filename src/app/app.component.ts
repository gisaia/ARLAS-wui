/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Filter } from 'arlas-api';
import {
  ChartType, DataType, MapglComponent, Position, MapglImportComponent,
  MapglSettingsComponent, RenderedGeometries, GeoQuery, GeometrySelectModel
} from 'arlas-web-components';
import * as mapboxgl from 'mapbox-gl';
import { SearchComponent } from 'arlas-wui-toolkit/components/search/search.component';
import {
  ChipsSearchContributor,
  ElementIdentifier,
  HistogramContributor,
  MapContributor,
  ResultListContributor,
  AnalyticsContributor
} from 'arlas-web-contributors';
import { Collaboration } from 'arlas-web-core';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasStartupService,
  ArlasMapSettings,
  ArlasMapService
} from 'arlas-wui-toolkit';
import { ContributorService } from './services/contributors.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { ArlasWalkthroughService } from 'arlas-wui-toolkit/services/walkthrough/walkthrough.service';

@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  public mapglContributor: MapContributor;
  public chipsSearchContributor: ChipsSearchContributor;
  public timelineContributor: HistogramContributor;
  public resultlistContributor: ResultListContributor;
  public analyticsContributor: AnalyticsContributor;


  public analytics: Array<any>;
  public refreshButton: any;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;
  public analyticsOpen = true;
  public searchOpen = true;
  public countAll: string;

  public appName: string;
  public appNameBackgroundColor: string;

  // component config
  public mapComponentConfig: any;
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;

  public fitbounds: Array<Array<number>> = [];
  public featureToHightLight: {
    isleaving: boolean,
    elementidentifier: ElementIdentifier
  };
  public featuresToSelect: Array<ElementIdentifier> = [];
  private isAutoGeosortActive;
  private geosortConfig;
  private allowMapExtend: boolean;
  private allowMapStyles: boolean;
  private mapBounds: mapboxgl.LngLatBounds;
  private mapStyles: Array<{ styleGroupId: string, styleId: string }>;
  private mapEventListener = new Subject();
  private mapExtendTimer: number;
  private MAP_EXTEND_PARAM = 'extend';
  private MAP_STYLES_PARAM = 'map_styles';

  public nbVerticesLimit = 50;
  public isMapMenuOpen = false;

  /* Options */
  public spinner: { show: boolean, diameter: string, color: string, strokeWidth: number }
    = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };
  public gauge: { show: boolean, maxValue: number, thresholdValue: number, currentValue: number }
    = { show: false, maxValue: 46000000, thresholdValue: 10000, currentValue: 46000000 };
  public showZoomToData = false;
  public showIndicators = false;


  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;
  @ViewChild('search', { static: true }) private searchComponent: SearchComponent;
  @ViewChild('import', { static: true }) public mapImportComponent: MapglImportComponent;
  @ViewChild('mapSettings', { static: false }) public mapSettings: MapglSettingsComponent;

  constructor(
    private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    private arlasStartUpService: ArlasStartupService,
    private mapSettingsService: ArlasMapSettings,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private walkthroughService: ArlasWalkthroughService,
    private mapService: ArlasMapService
  ) {
    if (this.arlasStartUpService.shouldRunApp) {
      this.resultlistContributor = this.arlasStartUpService.contributorRegistry.get('table');
      if (this.resultlistContributor) {
        this.resultlistContributor.sort = this.configService.getValue('arlas.server.collection.id');
      }
      this.appName = this.configService.getValue('arlas-wui.web.app.name') ?
        this.configService.getValue('arlas-wui.web.app.name') : 'ARLAS';
      this.appNameBackgroundColor = this.configService.getValue('arlas-wui.web.app.name_background_color') ?
        this.configService.getValue('arlas-wui.web.app.name_background_color') : '#FF4081';
      this.analyticsContributor = this.arlasStartUpService.contributorRegistry.get('analytics');
      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      const mapExtendTimer = this.configService.getValue('arlas.web.components.mapgl.mapExtendTimer');
      this.mapExtendTimer = (mapExtendTimer !== undefined) ? mapExtendTimer : 4000;
      this.allowMapExtend = this.configService.getValue('arlas.web.components.mapgl.allowMapExtend');
      this.allowMapStyles = this.configService.getValue('arlas.web.components.mapgl.allowMapStyles');
      this.nbVerticesLimit = this.configService.getValue('arlas.web.components.mapgl.nbVerticesLimit');
      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline');
      this.detailedTimelineComponentConfig = this.configService.getValue('arlas.web.components.detailedTimeline');
      this.analytics = this.configService.getValue('arlas.web.analytics');
      this.refreshButton = this.configService.getValue('arlas-wui.web.app.refresh');
      this.geosortConfig = this.configService.getValue('arlas-wui.web.app.components.geosort');

      if (this.configService.getValue('arlas.web.options.spinner')) {
        this.spinner = Object.assign(this.spinner, this.configService.getValue('arlas.web.options.spinner'));
      }
      if (this.configService.getValue('arlas.web.options.gauge')) {
        this.gauge = Object.assign(this.gauge, this.configService.getValue('arlas.web.options.gauge'));
      }
      if (this.configService.getValue('arlas.web.options.zoom_to_data')) {
        this.showZoomToData = true;
      }
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }
      if (this.analytics) {
        this.isAutoGeosortActive = this.analytics.filter(g => g.groupId === 'resultlist')
          .map(g => this.isAutoGeosortActive = g.components[0].input.isAutoGeoSortActived);
      }
      this.collaborativeService.collaborationBus.subscribe(collaborationEvent => {
        this.collaborativeService.countAll
          .pipe()
          .subscribe(c => this.countAll = c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
      });
    }
  }

  public ngOnInit() {
    if (this.arlasStartUpService.shouldRunApp) {
      this.mapglContributor = this.contributorService.getMapContributor();
      this.chipsSearchContributor = this.contributorService.getChipSearchContributor(this.searchComponent.onLastBackSpace);
      if (this.resultlistContributor) {
        this.resultlistContributor.addAction({ id: 'zoomToFeature', label: 'Zoom to', cssClass: '' });
      }
      if (this.allowMapExtend) {
        const extendValue = this.getParamValue(this.MAP_EXTEND_PARAM);
        if (extendValue) {
          const stringBounds = extendValue.split(',');
          if (stringBounds.length === 4) {
            this.mapBounds = new mapboxgl.LngLatBounds(
              new mapboxgl.LngLat(+stringBounds[0], +stringBounds[1]),
              new mapboxgl.LngLat(+stringBounds[2], +stringBounds[3])
            );
          }
        }
      }
      if (this.allowMapStyles) {
        /** Example : ...&map_styles=cluster:heat;features:ship_type&... */
        const mapStylesValue = this.getParamValue(this.MAP_STYLES_PARAM);
        if (mapStylesValue) {
          const styles = mapStylesValue.split(';');
          if (styles.length > 0) {
            this.mapStyles = new Array();
            styles.forEach(selectedStyle => {
              const sg_s = selectedStyle.split(':');
              if (sg_s.length === 2) {
                this.mapStyles.push({ styleGroupId: sg_s[0], styleId: sg_s[1] });
              }
            });
          }
        }
      }
    }

    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('bbox', this.domSanitizer.bypassSecurityTrustHtml('<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'));
    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('draw_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"   width="20"   height="20"   viewBox="0 0 20 20"   id="svg19167"   version="1.1"   inkscape:version="0.91+devel+osxmenu r12911"   sodipodi:docname="square.svg">  <defs     id="defs19169" />  <sodipodi:namedview     id="base"     pagecolor="#ffffff"     bordercolor="#666666"     borderopacity="1.0"     inkscape:pageopacity="0.0"     inkscape:pageshadow="2"     inkscape:zoom="11.313708"     inkscape:cx="11.681634"     inkscape:cy="9.2857143"     inkscape:document-units="px"     inkscape:current-layer="layer1"     showgrid="true"     units="px"     inkscape:window-width="1280"     inkscape:window-height="751"     inkscape:window-x="0"     inkscape:window-y="23"     inkscape:window-maximized="0"     inkscape:object-nodes="true">    <inkscape:grid       type="xygrid"       id="grid19715" />  </sodipodi:namedview>  <metadata     id="metadata19172">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-1032.3622)">    <path       inkscape:connector-curvature="0"       style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.5;marker:none;enable-background:accumulate"       d="m 5,1039.3622 0,6 2,2 6,0 2,-2 0,-6 -2,-2 -6,0 z m 3,0 4,0 1,1 0,4 -1,1 -4,0 -1,-1 0,-4 z" id="rect7797" sodipodi:nodetypes="cccccccccccccccccc" /><circle style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" id="path4364" cx="6" cy="1046.3622" r="2" /><circle id="path4368" style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" cx="14" cy="1046.3622" r="2" /><circle id="path4370" style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" cx="6" cy="1038.3622" r="2" /><circle style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" id="path4372" cx="14" cy="1038.3622" r="2" /> </g></svg>'));
    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('remove_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg   xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"   width="20"   height="20"   id="svg5738"   version="1.1"   inkscape:version="0.91+devel+osxmenu r12911"   sodipodi:docname="trash.svg"   viewBox="0 0 20 20">  <defs     id="defs5740" />  <sodipodi:namedview     id="base"     pagecolor="#ffffff"     bordercolor="#666666"     borderopacity="1.0"     inkscape:pageopacity="0.0"     inkscape:pageshadow="2"     inkscape:zoom="22.627417"     inkscape:cx="12.128184"     inkscape:cy="8.8461307"     inkscape:document-units="px"     inkscape:current-layer="layer1"     showgrid="true"     inkscape:window-width="1033"     inkscape:window-height="751"     inkscape:window-x="20"     inkscape:window-y="23"     inkscape:window-maximized="0"     inkscape:snap-smooth-nodes="true"     inkscape:object-nodes="true">    <inkscape:grid       type="xygrid"       id="grid5746"       empspacing="5"       visible="true"       enabled="true"       snapvisiblegridlinesonly="true" />  </sodipodi:namedview>  <metadata     id="metadata5743">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-1032.3622)">    <path       style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.99999982;marker:none;enable-background:accumulate" d="m 10,1035.7743 c -0.7849253,8e-4 -1.4968376,0.4606 -1.8203125,1.1758 l -3.1796875,0 -1,1 0,1 12,0 0,-1 -1,-1 -3.179688,0 c -0.323475,-0.7152 -1.035387,-1.175 -1.820312,-1.1758 z m -5,4.5879 0,7 c 0,1 1,2 2,2 l 6,0 c 1,0 2,-1 2,-2 l 0,-7 -2,0 0,5.5 -1.5,0 0,-5.5 -3,0 0,5.5 -1.5,0 0,-5.5 z"       id="rect2439-7"       inkscape:connector-curvature="0"       sodipodi:nodetypes="ccccccccccccccccccccccccc" />  </g></svg>'));
    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('import_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24pt" height="24pt" viewBox="0 0 24 24" version="1.1"><g id="surface1"><path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 9 16 L 15 16 L 15 10 L 19 10 L 12 3 L 5 10 L 9 10 Z M 5 18 L 19 18 L 19 20 L 5 20 Z M 5 18 "/></g></svg>'));
  }

  public ngAfterViewInit(): void {
    this.mapglComponent.switchLayer.pipe(debounceTime(200)).subscribe(data => this.mapglContributor.switchLayerCluster(data));
    let startDragCenter;
    let dragMove = false;
    this.mapService.setMap(this.mapglComponent.map);
    this.mapglComponent.map.on('dragstart', (e) => {
      dragMove = true;
      startDragCenter = this.mapglComponent.map.getCenter();
    });
    if (this.mapBounds && this.allowMapExtend) {
      (<mapboxgl.Map>this.mapglComponent.map).fitBounds(this.mapBounds);
      this.mapBounds = null;
    }
    this.mapglComponent.onMapLoaded.subscribe(isLoaded => {
      if (isLoaded) {
        if (this.mapStyles && this.allowMapStyles) {
          this.mapStyles.forEach(s => {
            this.mapglComponent.onChangeStyle(s.styleGroupId, s.styleId);
          });
        }
      }
    });
    this.mapglComponent.onStyleChanged.subscribe(styleGroups => {
      let selectedMapStyles = '';
      if (styleGroups) {
        styleGroups.forEach(sg => {
          if (sg.selectedStyle) {
            selectedMapStyles += selectedMapStyles !== '' ? ';' : '';
            selectedMapStyles += sg.id + ':' + sg.selectedStyle.id;
          }
        });
        const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
        queryParams[this.MAP_STYLES_PARAM] = selectedMapStyles;
        this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
      }
    });
    this.mapglComponent.map.on('moveend', (e) => {
      if (dragMove === true) {
        const endDragCenter = this.mapglComponent.map.getCenter();
        const startDragCenterPosition = this.mapglComponent.map.project(startDragCenter);
        const endDragCenterPosition = this.mapglComponent.map.project(endDragCenter);
        const deltaX = Math.abs(startDragCenterPosition.x - endDragCenterPosition.x);
        const deltaY = Math.abs(startDragCenterPosition.y - endDragCenterPosition.y);
        const mapWidth = e.target._canvas.clientWidth;
        const mapHeight = e.target._canvas.clientHeight;
        const dragRatio = (this.geosortConfig && Number(this.geosortConfig.dragRatio).toString() !== 'NaN') ?
          this.geosortConfig.dragRatio : 0.05;
        const minGeosortZoom = (this.geosortConfig && Number(this.geosortConfig.minGeosortZoom).toString() !== 'NaN') ?
          this.geosortConfig.minGeosortZoom : 8;
        if (this.isAutoGeosortActive && this.mapglComponent.map.getZoom() > minGeosortZoom) {
          if (((deltaX / mapWidth > dragRatio) || (deltaY / mapHeight > dragRatio)) && this.resultlistContributor) {
            this.resultlistContributor.geoSort(endDragCenter.lat, endDragCenter.lng, true);
          }
        }
      }
      dragMove = false;
      if (this.allowMapExtend) {
        this.mapEventListener.next();
      }

    });
    this.mapglContributor.countExtendBus.subscribe(data => {
      const re = /\ /gi;
      this.gauge.maxValue = parseFloat(this.countAll.replace(re, ''));
      this.gauge.thresholdValue = data.threshold;
      this.gauge.currentValue = data.count;
    });
    this.mapEventListener.pipe(debounceTime(this.mapExtendTimer)).subscribe(() => {
      /** Change map extend in the url */
      const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
      const extend = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
      const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
      queryParams[this.MAP_EXTEND_PARAM] = extend;
      this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    });
    if (this.walkthroughService.isActivable) {
      this.walkthroughService.startTour();
    }
    this.cdr.detectChanges();
  }

  public openMapSettings(): void {
    this.mapSettingsService.mapContributor = this.mapglContributor;
    this.mapSettingsService.componentConfig = this.configService.getValue('arlas.web.components');
    this.mapSettings.openDialog(this.mapSettingsService);
  }

  /**
   * Renders the selected geometries and corresponding styles
   */
  public renderSelectedGeometries(displayedGeometries: Array<RenderedGeometries>) {
    const renderedClusterGeometry: RenderedGeometries = displayedGeometries.find(d => d.mode === 'cluster');
    if (renderedClusterGeometry.selectedStyleGroups && renderedClusterGeometry.selectedStyleGroups[0]
      && renderedClusterGeometry.selectedStyleGroups[0].selectedStyle) {
      this.mapglContributor.setGeoAggregateGeomField(renderedClusterGeometry.geometries[0]);
      this.mapglContributor.setGeomStrategy(renderedClusterGeometry.selectedStyleGroups[0].selectedStyle.geomStrategy);

      this.mapglComponent.setStyleGroup(renderedClusterGeometry.selectedStyleGroups[0].id,
        renderedClusterGeometry.selectedStyleGroups[0].selectedStyle.id);
    }
    const featureGeos = displayedGeometries.find(d => d.mode === 'features');
    if (featureGeos) {
      featureGeos.selectedStyleGroups.forEach(sg => {
        this.mapglComponent.setStyleGroup(sg.id, sg.selectedStyle.id);
      });
      this.mapglContributor.setReturnedGeometries(displayedGeometries.find(d => d.mode === 'features').geometries.join(','));
    }
    const topologyGeos = displayedGeometries.find(d => d.mode === 'topology');
    if (topologyGeos) {
      topologyGeos.selectedStyleGroups.forEach(sg => {
        this.mapglComponent.setStyleGroup(sg.id, sg.selectedStyle.id);
      });
    }
    this.mapglContributor.onChangeGeometries();
  }

  /**
   * Applies the selected geo query
   */
  public applySelectedGeoQuery(geoQuery: GeoQuery) {
    this.mapglContributor.setGeoQueryOperation(geoQuery.operation);
    this.mapglContributor.setGeoQueryField(geoQuery.geometry_path);
    this.mapglContributor.onChangeGeoQuery();
  }

  public filterSearch(value: string) {
    if (value.trim() !== '') {
      const filter: Filter = {
        q: [[this.chipsSearchContributor.getConfigValue('search_field') + ':' + value.trim()]]
      };

      const collaboration: Collaboration = {
        filter: filter,
        enabled: true
      };

      this.collaborativeService.setFilter(this.chipsSearchContributor.identifier, collaboration);
    }
  }

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }

  public zoomToData() {
    if (!this.mapSettingsService.mapContributor) {
      this.mapSettingsService.mapContributor = this.mapglContributor;
    }
    if (!this.mapSettingsService.componentConfig) {
      this.mapSettingsService.componentConfig = this.configService.getValue('arlas.web.components');
    }
    const geoms: GeometrySelectModel[]
      = this.mapSettingsService.getClusterGeometries().filter((geom: GeometrySelectModel) => geom.selected === true);
    if (geoms.length > 0) {
      this.mapService.zoomToData(geoms[0].path, this.mapglComponent.map, 0.2);
    }
  }

  public getBoardEvents(event: { origin: string, event: string, data: any }) {
    switch (event.origin) {
      case 'table':
        switch (event.event) {
          case 'consultedItemEvent':
            const f = this.mapglContributor.getFeatureToHightLight(event.data);
            if (this.mapglContributor.isFlat) {
              f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
            }
            this.featureToHightLight = f;
            break;
          case 'selectedItemsEvent':
            if (event.data.length > 0 && this.mapComponentConfig) {
              this.featuresToSelect = event.data.map(id => {
                if (this.mapglContributor.isFlat) {
                  return {
                    idFieldName: this.mapComponentConfig.idFeatureField.replace(/\./g, '_'),
                    idValue: id
                  };
                } else {
                  return {
                    idFieldName: this.mapComponentConfig.idFeatureField,
                    idValue: id
                  };
                }
              });
            } else {
              this.featuresToSelect = [];
            }
            break;
          case 'actionOnItemEvent':
            switch (event.data.action.id) {
              case 'zoomToFeature':
                this.mapglContributor.getBoundsToFit(event.data.elementidentifier)
                  .subscribe(bounds => this.fitbounds = bounds);
                break;
            }
            break;
          case 'globalActionEvent':
            break;
          case 'geoSortEvent':
            if (this.resultlistContributor) {
              this.resultlistContributor.geoSort(this.mapglComponent.map.getCenter().lat, this.mapglComponent.map.getCenter().lng, true);
            }
            break;
          case 'geoAutoSortEvent':
            this.isAutoGeosortActive = event.data;
            break;
        }

        break;
    }
  }

  private getParamValue(param: string): string {
    let paramValue = null;
    const url = window.location.href;
    const regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (results && results[2]) {
      paramValue = results[2];
    }
    return paramValue;
  }
}
