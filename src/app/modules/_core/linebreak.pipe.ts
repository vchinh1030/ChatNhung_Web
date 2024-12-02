import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linebreak'
})
export class LinebreakPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;
    // Thay ký tự xuống dòng thành <br> và giữ nguyên định dạng HTML (như **)
    return value.replace(/\n/g, '<br>');
  }
}
