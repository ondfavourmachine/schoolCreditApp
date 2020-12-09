import { Component, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-picture",
  templateUrl: "./picture.component.html",
  styleUrls: ["./picture.component.css"]
})
export class PictureComponent implements OnInit {
  @Output() changeUpTheView = new EventEmitter<string>();
  constructor() {}

  ngOnInit(): void {}

  addPicture() {
    document.getElementById("picture-upload").click();
  }

  loadImage(event: Event) {
    let reader: FileReader;
    if (FileReader) {
      // check if the filereader api is supported by browser

      reader = new FileReader();
      reader.onload = anevent => {
        (document.querySelector(
          ".modified-img"
        ) as HTMLImageElement).src = `${anevent.target["result"]}`;
      };
      reader.readAsDataURL(event.target["files"][0]);
    }
  }
}
