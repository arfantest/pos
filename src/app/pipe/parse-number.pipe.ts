import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseNumber',
  standalone: true
})
export class ParseNumberPipe implements PipeTransform {

  transform(value: any, digitsInfo?: string): string | null {
    if (value == null || value === '') {
      return null;
    }

    // Convert to string first
    let stringValue = value.toString();
    
    // Extract first valid number from the string
    const numberMatch = stringValue.match(/^\d+\.?\d*/);
    if (numberMatch) {
      const numericValue = parseFloat(numberMatch[0]);
      if (!isNaN(numericValue)) {
        return this.formatNumber(numericValue, digitsInfo);
      }
    }

    // If no valid number found, try to clean the string
    const cleanedValue = stringValue.replace(/[^\d.-]/g, '');
    const numericValue = parseFloat(cleanedValue);
    
    if (!isNaN(numericValue)) {
      return this.formatNumber(numericValue, digitsInfo);
    }

    return 'Invalid Number';
  }

  private formatNumber(value: number, digitsInfo?: string): string {
    if (!digitsInfo) {
      return value.toLocaleString();
    }

    // Parse digitsInfo like '1.2-2'
    const parts = digitsInfo.split('.');
    const minIntegerDigits = parseInt(parts[0]) || 1;
    
    let minFractionDigits = 0;
    let maxFractionDigits = 3;
    
    if (parts[1]) {
      const fractionParts = parts[1].split('-');
      minFractionDigits = parseInt(fractionParts[0]) || 0;
      maxFractionDigits = parseInt(fractionParts[1]) || minFractionDigits;
    }

    return value.toLocaleString('en-US', {
      minimumIntegerDigits: minIntegerDigits,
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits
    });
  }
}