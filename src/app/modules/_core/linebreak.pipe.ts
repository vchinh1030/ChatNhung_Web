import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linebreak'
})
export class LinebreakPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;
    const formattedValue = value
    .replace(/\n/g, '<br>') // Thay thế xuống dòng thành <br>
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Thay **nội dung** thành <b>nội dung</b>

  return formattedValue;
  }
}
