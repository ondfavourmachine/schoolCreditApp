import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Parent } from "src/app/models/data-models";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { Store } from "@ngrx/store";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Subscription } from "rxjs";
import { pluck } from "rxjs/operators";

@Component({
  selector: "app-picture",
  templateUrl: "./picture.component.html",
  styleUrls: ["./picture.component.css"]
})
export class PictureComponent implements OnInit {
  @Output() changeUpTheView = new EventEmitter<string>();
  @Output() startSpinner = new EventEmitter<boolean>();
  constructor(
    private store: Store<fromStore.AllState>,
    private chatapi: ChatService
  ) {}

  ngOnInit(): void {}

  addPicture() {
    document.getElementById("picture-upload").click();
  }

  async loadImage(event: Event) {
    const updateParentInfo: Partial<Parent> = {
      picture: event.target["files"][0]
    };
    this.store.dispatch(new generalActions.addParents(updateParentInfo));
    let reader: FileReader;
    if (FileReader) {
      reader = new FileReader();
      reader.onload = anevent => {
        (document.querySelector(
          ".modified-img"
        ) as HTMLImageElement).src = `${anevent.target["result"]}`;
      };
      reader.readAsDataURL(event.target["files"][0]);
    }
  }

  async uploadImage() {
    this.startSpinner.emit(true);
    let guardID;
    let pictureFromStore: string | File;
    const disconnect: Subscription = this.store
      .pipe(pluck("manageParent", "parent_info"))
      .subscribe((val: Parent) => {
        const { picture, guardian } = val;
        guardID = guardian;
        pictureFromStore = picture;
      });
    try {
      const res = await this.chatapi.uploadParentPicture({
        picture: pictureFromStore as File,
        guardian: guardID
      });
      this.changeUpTheView.emit("four-digit-pin");
      disconnect.unsubscribe();
    } catch (error) {
      console.log(error);
    }
  }
}
