
import { Pipe, PipeTransform } from "@angular/core";
import { SchoolBook } from "../models/data-models";


@Pipe({
  name: "filter"
})
export class FilterPipe implements PipeTransform {
  transform(items: any, searchText: string): any {
    if (searchText === undefined) return items;
    //return updated ninjas array containing searched items
    return items.filter((item: SchoolBook) => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
      // console.log(item.clientname);
    });
  }
}