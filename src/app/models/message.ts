import { GiverResponse, replyGiversOrReceivers } from "./GiverResponse";

export interface checkDOBResponse {
  data: { name: string; date_of_birth: string };
  message: string;
  status: boolean;
  dob: boolean;
}

export class Message {
  text: string;
  direction: string;
  htmlElement: HTMLElement;
  buttonElement: string;
  extraInfo: string;
  countForMessage: number = 0;
  static timeOutMessages = [
    "You ran out of time! Try to answer as fast as possible",
    "Oops, didnt get a response! Try to answer as fast as possible",
    "Time waits for no one! Try to answer as fast as possible",
    "You can do it! Answer the next question faster!"
  ];

  static welcomeMessagesForGiver = [
    "Welcome to Adama High School. The Citadel of excellence",
    "This Service helps you manage how you pay your child's fees",
    "How do you want to proceed?"
  ];

  static successfulRequestsMade = [
    `We have procesed your request and sent it for
    assistance.`,
    `Our target is to send you someone who can give
    you some money to buy food items during this
    lockdown.
    `,
    `God bless you and your family. God bless
    Nigeria.`
  ];

  static failedRequests = [
    `Sorry, We couldnt process your request at this time.`,
    `You, can try again later`,
    `We wish you all the best in this trying times`
  ];

  static welcomeMsgForReceiver: string[] = [
    "Good Morning, My name is Tabitha. I represent a private initiative from concerned Nigerians who want to help",
    `In times like these, what makes us a great Nation is our ability to find people who care enough to help.`,
    `Would you like me to find someone to assist your
    family?
    `
  ];
  constructor(
    text: string,
    direction: string,
    HtmlElement: HTMLElement | HTMLUListElement,
    buttonElement?: string,
    extraInfo?: string
  ) {
    this.text = text;
    this.direction = direction;
    this.htmlElement = HtmlElement;
    this.buttonElement = buttonElement;
    this.extraInfo = extraInfo;
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  makeAndInsertMessage(count: number) {
    // if the try block fails, then there isn't text in the button string to generate an
    // array from so control moves to the catch block and executes the code there
    try {
      const arrayOfStrings: Array<string> = this.buttonElement.split(",");
      const arrayOfExtraInfo: Array<string> = this.extraInfo.split(",");
      const parentWrapperDiv = document.createElement("div");
      parentWrapperDiv.setAttribute("data-time", `${this.addDate()}`);
      parentWrapperDiv.className = `chat-box__wrapper ${this.direction}`;
      const firstAfterPArentDiv = document.createElement("div");
      const avatarImage = document.createElement("img");

      // this div will be placed immediately after the parentWrapperDiv
      firstAfterPArentDiv.className = "chat-box__inner-wrapper";

      // set image
      avatarImage.src = `../../../assets/chatbotImages/${
        this.direction == "left" ? "avatar.png" : "avatar2.png"
      }`;
      avatarImage.className = "avatar";

      // secondDiv after image
      const secondDivAfterImage = document.createElement("div");
      secondDivAfterImage.className = "chat-box__text-wrapper";
      secondDivAfterImage.textContent = `${this.text}`;
      // const thirdDiv = document.createElement("div");
      // thirdDiv.className = "text";

      secondDivAfterImage.insertAdjacentElement;
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      for (let i = 0; i < arrayOfStrings.length; i++) {
        const button = document.createElement("button");
        button.setAttribute(
          "data-button",
          `${arrayOfStrings[i]}-${arrayOfExtraInfo[i]}`
        );
        // button.setAttribute("data-button", `${arrayOfStrings[i]}`);
        button.className = "btn btn button--no-width dynamicButton";
        button.textContent = arrayOfStrings[i];
        button.onclick = this.handleButtonClick;
        buttonContainer.insertAdjacentElement("beforeend", button);
      }

      // secondDivAfterImage.insertAdjacentElement("beforeend", thirdDiv);
      secondDivAfterImage.insertAdjacentElement("beforeend", buttonContainer);
      // decide whether to add or remove image

      this.addOrRemoveImage(firstAfterPArentDiv, count, avatarImage);
      // firstAfterPArentDiv.insertAdjacentElement("afterbegin", avatarImage);
      firstAfterPArentDiv.insertAdjacentElement(
        "beforeend",
        secondDivAfterImage
      );
      parentWrapperDiv.insertAdjacentElement("beforeend", firstAfterPArentDiv);
      this.htmlElement.insertAdjacentElement("beforeend", parentWrapperDiv);
    } catch (e) {
      // debugger;
      if (count == 0) {
        // console.log(0);
        const html = `
        <div data-time="${this.addDate()}" class="chat-box__wrapper ${
          this.direction
        }">  
        <div class="chat-box__inner-wrapper">
          <img
            src="../../../assets/chatbotImages/avatar.png"
            alt=""
            class="avatar"
          />
          <div class="chat-box__text-wrapper">
            ${this.text}
           
          </div>
        </div>
      </div>
      `;
        this.htmlElement.insertAdjacentHTML("beforeend", html);
        // this.countForMessage++;
      } else {
        this.modifyMessageBeforeInserting(count);
      }

      // this.htmlElement.insertAdjacentHTML("beforeend", html);
    }
  }

  addDate() {
    return Date.now();
  }
  modifyMessageBeforeInserting(count) {
    // debugger;
    let nodelist: NodeList = document.querySelectorAll(
      ".chat-box__wrapper.left"
    );
    // debugger;
    let time: number | string = (nodelist[nodelist.length - 1] as HTMLElement)
      .dataset.time;
    time = Number(time);
    time = Math.round(time);
    let timeNow = Math.round(Date.now());
    if (timeNow > time) {
      let diff = timeNow - time;
      let timediffInSeconds = Math.round(diff / 1000);
      if (
        timediffInSeconds < 200 &&
        this.direction.trim() == "left" &&
        count > 0
      ) {
        // debugger;
        // console.log(this.direction.trim(), time);
        const html = `
        <div data-time="${this.addDate()}" class="chat-box__wrapper ${
          this.direction
        }">  
        <div class="chat-box__inner-wrapper">
          
          <div class="chat-box__text-wrapper">
            ${this.text}
           
          </div>
        </div>
      </div>
      `;
        this.htmlElement.insertAdjacentHTML("beforeend", html);
      } else {
        const html = `
         <div data-time="${this.addDate()}" class="chat-box__wrapper ${
          this.direction
        }">  
        <div class="chat-box__inner-wrapper">
      
      <div class="chat-box__text-wrapper">
        ${this.text}  
        <i class="fa fa-check-double read-indicator"></i>
      </div>
    </div>
  </div>
  `;
        this.htmlElement.insertAdjacentHTML("beforeend", html);
      }
    } else {
      const html = `
      <div data-time="${this.addDate()}" class="chat-box__wrapper ${
        this.direction
      }">  
      <div class="chat-box__inner-wrapper">
        
        <div class="chat-box__text-wrapper">
          ${this.text}
         
        </div>
      </div>
    </div>
    `;
      this.htmlElement.insertAdjacentHTML("beforeend", html);
    }
  }

  addOrRemoveImage(
    parentDiv: HTMLElement,
    count: number,
    avatar: HTMLImageElement
  ) {
    let nodelist: NodeList = document.querySelectorAll(
      ".chat-box__wrapper.left"
    );
    let time: number | string = (nodelist[nodelist.length - 1] as HTMLElement)
      .dataset.time;
    time = Number(time);
    time = Math.round(time);
    // console.log(time);
    let timeNow = Math.round(Date.now());
    if (timeNow > time) {
      let diff = timeNow - time;
      let timediffInSeconds = Math.round(diff / 1000);
      if (
        timediffInSeconds < 20 &&
        this.direction.trim() == "left" &&
        count > 0
      ) {
        // avatarImage.src = `../../../assets/chatbotImages/${
        //   this.direction == "left" ? "avatar.png" : "avatar2.png"
        // }`;
        //  avatarImage.className = "avatar";
        // do nothing
      } else {
        avatar.src = `../../../assets/chatbotImages/${
          this.direction == "left" ? "avatar.png" : "avatar2.png"
        }`;
        avatar.className = "avatar";
        parentDiv.insertAdjacentElement("afterbegin", avatar);
      }
    } else {
      avatar.src = `../../../assets/chatbotImages/${
        this.direction == "left" ? "avatar.png" : "avatar2.png"
      }`;
      avatar.className = "avatar";
      parentDiv.insertAdjacentElement("afterbegin", avatar);
    }
  }
  static GenerateMessagesForTimeOutScenarios(): string {
    let number = Math.floor(Math.random() * this.timeOutMessages.length);
    return this.timeOutMessages[number];
  }

  // static welcomeMessagesGenerator(): string {
  //   let number = Math.floor(Math.random() * this.welcomeMessages.length);
  //   return this.welcomeMessages[number];
  // }

  // static welcomeMessagesFor

  static displayMsgWhenThereIsServerError(): string {
    return `Sorry, an error occured while trying to connect to our servers. Please
     check your internet connection and reload the page to try again.`;
  }

  // static showQuestions(msg: string): string{
  //     return
  // }

  static wrongBVNNumberMessages(): string {
    const bvnmessages = [
      "Oops! wrong number length, Kindly enter an 11 digit BVN number",
      "The BVN number you entered is not valid. An 11 digit BVN number is expected. Kindly enter an 11 digit BVN number"
    ];
    const number = Math.floor(Math.random() * bvnmessages.length);
    return bvnmessages[number];
  }

  static dateOfBirthMessages(str?: string): string {
    const dateOfBirthMsg = [
      "Please, enter your date of birth in the format:(day-month-year: 09-08-1995)"
    ];
    const failureMessages = [
      `Oops wrong format! ${dateOfBirthMsg[0].split(",")[1]}`,
      `The format you entered is wrong! Please ${
        dateOfBirthMsg[0].split(",")[1]
      }`,
      `Try again! ${dateOfBirthMsg[0].split(",")[1]}`
    ];
    let result;
    switch (str) {
      case undefined:
        result = dateOfBirthMsg[0];
        break;
      case "failure":
        const number = Math.floor(Math.random() * failureMessages.length);
        result = failureMessages[number];
        break;
    }
    return result;
  }

  handleButtonClick(event: MouseEvent) {
    let button = event.srcElement as HTMLButtonElement;
    let c = button.dataset["button"].toString().toLowerCase();
    c = c.split("-")[1];
    if (!isNaN(Number(c))) {
      // this.handleUpload(button.dataset["button"]);
      this.handleUpload("");
      return;
    }

    switch (c) {
      case "yes":
      case "start":
      case "connectme":
      case "start":
        this.giverDispatchEvents(
          "customGiverEventFromMsgClass",
          "giver",
          "bank-partnership"
        );
        this.giverResponsesEvent(
          "customGiverResponse",
          new replyGiversOrReceivers(
            "Yes connect me to a financial institution",
            "right"
          )
        );
        break;
      case "begin":
        this.dispatchevent(
          "customEventFromMessageClass",
          "terms-and-condition"
        );
        break;
      case "help":
        this.receiverDispatchEvents(
          "customReceiverEventFromMsgClass",
          "",
          "Yes, help me",
          ""
        );
        break;
      case "location on":
        this.receiverDispatchEvents(
          "customReceiverEventFromMsgClass",
          "",
          "Yes, my location is turned on.",
          ""
        );
        break;
      case "location now on":
        this.receiverDispatchEvents(
          "customReceiverEventFromMsgClass",
          "",
          "I have turned on my location",
          ""
        );
        break;
      case "forget about it":
        this.receiverDispatchEvents(
          "customReceiverEventFromMsgClass",
          "",
          "Continue without it",
          ""
        );
        break;
      case "provide bvn":
        this.dispatchevent("customEventFromMessageClass", "bvn");
        break;
      case "startgiving":
        // console.log(button.dataset);
        this.dispatchevent(
          "customEventFromMessageClass",
          "",
          "yes, this is my first time"
        );
        break;
      // giveFood
      case "enterchildinfo":
        this.giverDispatchEvents(
          "customGiverEventFromMsgClass",
          "giver",
          "child-information-forms"
        );
        // sessionStorage.setItem("anonymous", "2");
        break;
      case "installmental":
        this.giverResponsesEvent(
          "customGiverResponse",
          new replyGiversOrReceivers(
            "We would like to collect your child's information.",
            "left",
            "Start",
            "enterchildinfo",
            "allow"
          )
        );
        break;
      case "edit":
        this.giverDispatchEvents(
          "customGiverEventFromMsgClass",
          "giver",
          "edit-parent-info"
        );
        // sessionStorage.setItem("anonymous", "2");
        break;
      case "cancel":
        this.giverResponsesEvent(
          "customGiverResponse",
          new replyGiversOrReceivers(
            "Awesome, We have partnered with banks who will like to finance this transaction.",
            "left",
            "Start",
            "start",
            "allow"
          )
        );
        break;
      case "givefood":
        this.giverResponsesEvent(
          "customGiverResponse",
          new replyGiversOrReceivers(
            "We are still working out the modalities for enabling help by food.",
            "left",
            "I want to give money",
            "identify,stayanonymous"
          )
          // new GiverResponse(
          //   new replyGiversOrReceivers("Yes, i am a first time giver", "right")
          // )
        );
        sessionStorage.setItem("anonymous", "2");
        break;
      case "stayanonymous":
        this.giverDispatchEvents(
          "customGiverEventFromMsgClass",
          "giver",
          "child-information-forms"
        );
        sessionStorage.setItem("anonymous", "1");
        break;

      case "continue":
        this.giverDispatchEvents(
          "customGiverEventFromMsgClass",
          "giver",
          "parents-information"
        );
        break;
      // responses by the giver starts here
      case "newrequest":
        // Pay in full
        this.giverResponsesEvent(
          "customGiverResponse",
          new replyGiversOrReceivers(
            "We would like to quickly register you for this school fees payment service?",
            "left",
            "Continue",
            "continue,full_pay"
          ),
          new GiverResponse(
            new replyGiversOrReceivers(`It's a new request`, "right")
          )
        );
        break;
      case "continuingrequest": //notFirstTimeGiver
        this.giverDispatchEvents(
          "customGiverEventFromMsgClass",
          "giver",
          "continuing-existing-requests",
          "",
          (): boolean => {
            const checkForLastStop: boolean = true;
            return checkForLastStop;
          }
        );
        // this.giverResponsesEvent(
        //   "customGiverResponse",
        //   new replyGiversOrReceivers(
        //     "Would you like to stay anonymous or be an identified giver?",
        //     "left",
        //     "I want to be identified,Stay anonymous",
        //     "identify,stayanonymous"
        //   ),
        //   new GiverResponse(
        //     new replyGiversOrReceivers(
        //       "No, i am not a first time giver",
        //       "right"
        //     )
        //   )
        // );
        break;
      case "givemoney":
        this.giverDispatchEvents(
          "customGiverEventFromMsgClass",
          "giver",
          "supportPageForms"
        );
        break;
      case "givefood":
        break;
      //  ends here
      case "money":
        this.dispatchevent("customEventFromMessageClass", "supportPage", "");
        break;
      case "upload photo and statement":
        this.dispatchevent(
          "customEventFromMessageClass",
          "uploadPhotoAndStatement"
        );
        break;
      case "receive":
        this.receiverDispatchEvents(
          "customReceiverEventFromMsgClass",
          "transparency-disclaimer",
          "",
          ""
        );
        break;
      case "give":
        this.giverDispatchEvents("customGiverEventFromMsgClass", "giver", "");
        break;
      case " no i do not":
        this.dispatchevent("customEventFromMessageClass", "skip");
        break;
      case "play":
        this.dispatchevent("customEventFromMessageClass", "startTest");
        break;
    }
  }

  receiverDispatchEvents(
    typeOfEvent: string,
    stage: string,
    message?: string,
    text?: string
  ) {
    const event: Event = new CustomEvent(typeOfEvent, {
      detail: { stage, message, text },
      bubbles: true
    });
    this.htmlElement.dispatchEvent(event);
  }

  giverDispatchEvents(
    typeOfEvent: string,
    message: string,
    componentToLoad: string,
    moreInformation?: string,
    callBack?: Function
  ) {
    const event: Event = new CustomEvent(typeOfEvent, {
      detail: {
        typeOfEvent,
        message,
        componentToLoad,
        moreInformation,
        callBack
      },
      bubbles: true
    });
    this.htmlElement.dispatchEvent(event);
  }

  dispatchevent(typeOfEvent: string, message?: string, text?: string) {
    const event: Event = new CustomEvent(typeOfEvent, {
      detail: { message, text },
      bubbles: true
    });
    this.htmlElement.dispatchEvent(event);
  }

  giverResponsesEvent(
    typeOfEvent: string,
    message: replyGiversOrReceivers,
    reply?: GiverResponse
  ) {
    const event: Event = new CustomEvent(typeOfEvent, {
      detail: { message, typeOfEvent, reply },
      bubbles: true
    });
    this.htmlElement.dispatchEvent(event);
  }

  handleUpload(stringToPassAlong?: string) {
    // debugger;
    this.giverDispatchEvents(
      "customGiverEventFromMsgClass",
      "giver",
      "parents-information",
      stringToPassAlong ? stringToPassAlong : ""
    );
  }
}
