import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';


import { ConfigService, CollaborativesearchService } from 'arlas-web-core';
import { ExploreApi, Configuration } from 'arlas-api';



@Injectable()
export class ArlasWuiConfigService extends ConfigService {
    constructor() {
        super();
    }
}
@Injectable()
export class ArlasWuiCollaborativesearchService extends CollaborativesearchService {
    constructor() {
        super();
    }
}

@Injectable()
export class ArlasWuiStartupService {
    private config: Object;
    constructor(private http: Http,
        private configService: ArlasWuiConfigService,
        private collaborativesearchService: ArlasWuiCollaborativesearchService) {
    }

    public load(): Promise<any> {
        this.config = {};
        const ret = this.http
            .get('config.json')
            .map((response: Response) => response.json())
            .toPromise()
            .then((configResponse: any) => {
                this.config = configResponse;
                this.configService.setConfig(this.config);
                this.collaborativesearchService.setConfigService(this.configService);
                const configuration: Configuration = new Configuration();
                const arlasWuiService: ExploreApi = new ExploreApi(this.http,
                    this.configService.getValue('arlas.server.server$default.url'),
                    configuration
                );
                this.collaborativesearchService.setExploreApi(arlasWuiService);
                this.collaborativesearchService.collection = this.configService.getValue('arlas.server.collection$default.collection');
                this.collaborativesearchService.setCountAll();
            })
            .catch((err: any) => {
                return Promise.resolve(null);
            });
        return ret.then((x) => {});
    }


}
