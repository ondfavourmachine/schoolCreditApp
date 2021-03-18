import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { Parent } from "src/app/models/data-models";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { ImageCroppedEvent } from "ngx-image-cropper";
import { Store } from "@ngrx/store";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Subscription } from "rxjs";
import { pluck } from "rxjs/operators";
import { GeneralService } from "src/app/services/generalService/general.service";

@Component({
  selector: "app-picture",
  templateUrl: "./picture.component.html",
  styleUrls: ["./picture.component.css"]
})
export class PictureComponent implements OnInit {
  @Output() changeUpTheView = new EventEmitter<string>();
  @Output() startSpinner = new EventEmitter<boolean>();
  @Input('fromWhere') fromWhere: string;
  showModal: string;
  imageChangedEvent: any = null;
  rawFile: File;
  modifiedFile: File;
  croppedImage: any;
  constructor(
    private store: Store<fromStore.AllState>,
    private chatapi: ChatService,
    private generalservice: GeneralService
  ) {}

  ngOnInit(): void {
    this.modifiedFile = undefined;
  }

  addPicture() {
    document.getElementById("picture-upload").click();
  }

  lauchModal() {
    this.showModal = "block";
  }

  closeModal() {
    this.showModal = "none";
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  fileToBeCropped(event: Event) {
    this.modifiedFile = undefined;
    this.imageChangedEvent = event;
    this.rawFile = event.target["files"][0];
    this.modifiedFile = undefined;
    this.lauchModal();
  }

  async imageCroppingDone() {
    this.modifiedFile = await this.generalservice.dataUrlToFile(
      this.croppedImage,
      this.rawFile.name
    );
    this.loadImage(this.modifiedFile);
    this.closeModal();
  }

  async loadImage(event: File) {
    const updateParentInfo: Partial<Parent> = {
      picture: event
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
      reader.readAsDataURL(event);
    }
  }

  async uploadImage() {
    if (this.modifiedFile) {
      this.startSpinner.emit(true);
      this.changeUpTheView.emit("done");
      // let guardID;
      // let pictureFromStore: string | File;
      // const disconnect: Subscription = this.store
      //   .pipe(pluck("manageParent", "parent_info"))
      //   .subscribe((val: Parent) => {
      //     const { picture, guardian } = val;
      //     guardID = guardian;
      //     pictureFromStore = picture;
      //   });
      // try {
      //   const res = await this.chatapi.uploadParentPicture({
      //     picture: pictureFromStore as File,
      //     guardian: guardID
      //   });
      //   this.changeUpTheView.emit("four-digit-pin");
      //   disconnect.unsubscribe();
      // } catch (error) {
      //   this.startSpinner.emit(false);
      //   this.generalservice.errorNotification(
      //     "We could not upload the given picture. Please try again or try another picture!"
      //   );
      //   console.log(error);
      // }
    }
    // console.log("nothing to upload!");
  }
}
