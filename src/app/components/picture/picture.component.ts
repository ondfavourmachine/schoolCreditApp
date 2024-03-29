import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, OnDestroy } from "@angular/core";
import { Parent } from "src/app/models/data-models";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { ImageCroppedEvent } from "ngx-image-cropper";
import { Store } from "@ngrx/store";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Subscription } from "rxjs";
import { pluck, tap } from "rxjs/operators";
import { GeneralService } from "src/app/services/generalService/general.service";

@Component({
  selector: "app-picture",
  templateUrl: "./picture.component.html",
  styleUrls: ["./picture.component.css"]
})
export class PictureComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() changeUpTheView = new EventEmitter<string>();
  @Output() updateLastPage = new EventEmitter<string>();
  @Output() startSpinner = new EventEmitter<boolean>();
  @Output() childPicture = new EventEmitter<File>();
  @Input('fromWhere') fromWhere: any;
  @Input('pictureForUseWhenChildIsTryingToEdit') pictureForUseWhenChildIsTryingToEdit: string | File | ArrayBuffer;
  showModal: string;
  imageChangedEvent: any = null;
  rawFile: File;
  modifiedFile: File;
  croppedImage: any;
  fileFromStore: string;
  destroy: Subscription[] =[];
  imageHasBeenLoadedInCropper: 'yes' | 'no' | 'inactive' = 'inactive';
  pictureForUseWhenParentIsTryingToEdit: File | string;
 
  constructor(
    private store: Store<fromStore.AllState>,
    private chatapi: ChatService,
    private generalservice: GeneralService
  ) {}

  ngOnInit(): void {
    
    this.destroy[0] = this.store
     .select(fromStore.getParentState)
     .pipe(tap(val => {
       if((val['parent_info'] as Object).hasOwnProperty('picture')){
        this.pictureForUseWhenParentIsTryingToEdit = val['parent_info']['picture'];
       }
     }), pluck ('editMode'))
     .subscribe(val => {
       if(!val) return;
       let reader;
       if (FileReader) {
        reader = new FileReader();
        reader.onload = anevent => {
          this.fileFromStore = `${anevent.target["result"]}`;  
        };
        reader.readAsDataURL(this.pictureForUseWhenParentIsTryingToEdit);
      }
     })
     if(this.pictureForUseWhenChildIsTryingToEdit){
        this.handleChildIstryingToEdit(this.pictureForUseWhenChildIsTryingToEdit as File)
     }
    this.modifiedFile = undefined;
    this.updateLastPage.emit('address');
    
  }

 async ngAfterViewInit(){
    // this.store.select(fromStore.getCurrentParentInfo)
    //  .pipe(pluck('picture'))
    // .subscribe(val =>{
    //   if(!val) return;
    //   let reader: FileReader;
    //   if (FileReader) {
    //     reader = new FileReader();
    //     reader.onload = anevent => {
    //      this.fileFromStore = `${anevent.target["result"]}`;
    //     };
    //     reader.readAsDataURL(val as File);
    //     try{
    //       (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
    //     }catch(error){
    //       // (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
    //     }
    //   }
    // })
    this.tryToPrefillPicture();
  }


 

  getPictureFromSessionStorage(name: string){
    return new Promise((resolve, reject) => {
      const picture = sessionStorage.getItem(name);
      if(typeof picture == 'object'){
        // reject(picture);
        throw 'Error picture not found';
      }else{
          resolve(picture);
      }
      
    })
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
    // this.imageHasBeenLoadedInCropper = true;
    
    this.croppedImage = event.base64;
    if(this.croppedImage ){
      this.imageHasBeenLoadedInCropper = 'yes';
    }
  }

  fileToBeCropped(event: Event) {
    this.modifiedFile = undefined;
    this.imageChangedEvent = event;
    this.rawFile = event.target["files"][0];
    // console.log(this.rawFile.size);
    this.modifiedFile = undefined;
    // this.startSpinner.emit(true);
    this.imageHasBeenLoadedInCropper = 'no';
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
    
    if(this.fromWhere == 'child-information-form'){
      this.childPicture.emit(this.modifiedFile);
    }
    else if(this.pictureForUseWhenChildIsTryingToEdit){
      // this.childPicture.emit(this.modifiedFile);
      //   return;
    }
    else{
      this.store.dispatch(new generalActions.addParents(updateParentInfo));
    }
    let reader: FileReader;
    if (FileReader) {
      reader = new FileReader();
      reader.onload = anevent => {
        (document.querySelector(
          ".modified-img"
        ) as HTMLImageElement).src = `${anevent.target["result"]}`;
        this.fileFromStore = `${anevent.target["result"]}`;
        if(this.fromWhere == 'child-information-form'){
          sessionStorage.setItem('childPicture', this.fileFromStore);
        }else{
          sessionStorage.setItem('parentPicture', this.fileFromStore);
        }
        
      };
      reader.readAsDataURL(event);
    }
    (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
  }

  async uploadImage() {
    // debugger;
    if (this.modifiedFile || this.pictureForUseWhenParentIsTryingToEdit) {
      this.startSpinner.emit(true);
      this.changeUpTheView.emit("done");
    }
    if(this.pictureForUseWhenChildIsTryingToEdit instanceof File){
      this.childPicture.emit(this.modifiedFile || this.pictureForUseWhenChildIsTryingToEdit);
    }
    // console.log("nothing to upload!");
  } 


  async  tryToPrefillPicture(){
    let pictureFromStorage;
    if(this.fromWhere == 'child-information-form'){ 
      try {
        const res = await this.getPictureFromSessionStorage('parentPicture');
        pictureFromStorage = res;
        res == 'null' ? this.fileFromStore = null : this.fileFromStore = res as string;
       } catch (error) {
        if(this.pictureForUseWhenChildIsTryingToEdit){
          (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
        }
         return;
       }

      try{
        (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
       }catch(error){
       (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
      }

      this.modifiedFile = await this.generalservice.dataUrlToFile(pictureFromStorage as string, 'image_1');

    }else{
      
      try {
        const res = await this.getPictureFromSessionStorage('parentPicture');
        pictureFromStorage = res;
        res == 'null' ? this.fileFromStore = null : this.fileFromStore = res as string;
       } catch (error) {
        if(this.pictureForUseWhenParentIsTryingToEdit){
          (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
        }
         return;
       }
      try{
        (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
       }catch(error){
       (document.getElementById('uploadButton') as HTMLButtonElement).disabled = false;
      }
      this.modifiedFile = await this.generalservice.dataUrlToFile(pictureFromStorage as string, 'image_1')
    }
  }

  handleChildIstryingToEdit(picture: File){
    let reader;
    if (FileReader) {
      reader = new FileReader();
      reader.onload = anevent => {
        this.fileFromStore = `${anevent.target["result"]}`;  
      };
      reader.readAsDataURL(this.pictureForUseWhenChildIsTryingToEdit);
    }
  }

  ngOnDestroy(){
    this.destroy.forEach(elem => elem.unsubscribe());
    this.pictureForUseWhenParentIsTryingToEdit = undefined;
    this.modifiedFile = undefined;
  }
}
