import { Pipe, PipeTransform } from '@angular/core';
import { ResultlistService } from 'app/services/resultlist.service';
import { ResultListContributor } from 'arlas-web-contributors';

@Pipe({
  name: 'getResultlistConfig'
})
export class GetResultlistConfigPipe implements PipeTransform {

  public constructor(private resultlistService: ResultlistService) { }

  public transform(resultlistContributor: ResultListContributor): any {
    // console.log(resultlistContributor.identifier);
    // console.log(this.resultlistService.resultlistConfigPerContId.get(resultlistContributor.identifier));
    return this.resultlistService.resultlistConfigPerContId.get(resultlistContributor.identifier);
  }

}
