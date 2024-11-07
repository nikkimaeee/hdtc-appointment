import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'commaToLineBreak' })
export class CommaToLineBreak implements PipeTransform {
  transform(value: string): string {
    return value.replace(/,/g, '<br/>');
  }
}
