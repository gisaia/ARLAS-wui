import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getConfigListName'
})
export class GetConfigListNamePipe implements PipeTransform {

  public transform(value: string): string {
    return value.split('config_list_')[1];
  }

}
