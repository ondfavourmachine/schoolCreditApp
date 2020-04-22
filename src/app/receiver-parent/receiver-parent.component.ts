import { Component, OnInit } from "@angular/core";
import { GeneralService } from "../services/generalService/general.service";

@Component({
  selector: "app-receiver-parent",
  templateUrl: "./receiver-parent.component.html",
  styleUrls: ["./receiver-parent.component.css"]
})
export class ReceiverParentComponent implements OnInit {
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {
    this.getLocationOfUser();
    this.generalservice.handleFlowController("welcomeModal");
  }

  async getLocationFromIp() {
    try {
      const { longitude, latitude } = await (await fetch(
        "https://api.ipstack.com/check?access_key=2f2fdee3320b5dcebf5b167167dd96f2"
      )).json();
      let location = { latitude, longitude };
      // console.log(this.generalservice.location);
      sessionStorage.setItem("userLatLng", JSON.stringify(location));
      // this.verifyLocation(this.location);
    } catch (error) {
      console.log("Location error.. ", error);
    }
  }

  getLocationOfUser() {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        this.findPerson,
        this.errorFindingPerson,
        { enableHighAccuracy: true }
      );
    }
  }

  findPerson(position) {
    const { longitude, latitude } = position.coords;
    let location = { latitude, longitude };
    // console.log(position);
    sessionStorage.setItem("userLatLng", JSON.stringify(location));
  }

  errorFindingPerson(e) {
    console.log(e);
    this.getLocationFromIp();
  }
}
