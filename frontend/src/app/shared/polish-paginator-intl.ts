import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PolishPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Elementów na stronie:';
  override nextPageLabel = 'Następna strona';
  override previousPageLabel = 'Poprzednia strona';
  override firstPageLabel = 'Pierwsza strona';
  override lastPageLabel = 'Ostatnia strona';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 z ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} – ${endIndex} z ${length}`;
  };
}
