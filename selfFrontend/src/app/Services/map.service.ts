import { Injectable, OnInit } from '@angular/core';
import * as saveAs from 'file-saver';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnInit {
  constructor() {}
  ngOnInit(): void {}

  onDownload(DataArray: any) {
    if (DataArray.length < 0) return;
    const csv = Papa.unparse(DataArray);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'tableData.csv');
  }
}
