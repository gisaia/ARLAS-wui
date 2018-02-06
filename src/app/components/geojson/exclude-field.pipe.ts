import { Pipe, PipeTransform } from '@angular/core';
import { ArlasSearchField } from 'app/components/geojson/model/field';

@Pipe({ name: 'excludeField' })
export class ExcludeFieldPipe implements PipeTransform {

  transform(allField: ArlasSearchField[], type: Set<string>) {
    return allField.filter(field => !type.has(field.type));
  }
}
