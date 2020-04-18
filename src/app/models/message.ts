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
  static welcomeMessages = [
    "Hey! My name is Dorcas. Thank you for trying to help out in these times."
  ];

  static welcomeMsgForReceiver: string[] = [
    "Good Morning, My name is Dorcas. I represent a private initiative from concerned Nigerians who want to help",
    "In times like these, what makes us a great Nation is our ability to find people who care enough to help",
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
        // button.style.fontSize = "16px";
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

  //   // <small>
  //   <img src="img/clock.png" alt="" />
  //   11:01 AM | Yesterday
  // </small>
  // <div class="button-container">
  // <button id="myBtn" class="btn btn button--no-width">
  //   GENERATE
  // </button>
  // <button class="btn btn button--no-width">
  //   cancel
  // </button>
  // </div>

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
        timediffInSeconds < 20 &&
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

  static welcomeMessagesGenerator(): string {
    let number = Math.floor(Math.random() * this.welcomeMessages.length);
    return this.welcomeMessages[number];
  }

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
    // console.log(c);
    switch (c) {
      case "yes":
      case "start":
      case "begin":
        this.dispatchevent(
          "customEventFromMessageClass",
          "terms-and-condition"
        );
        break;
      case "no":
      case "cancel":
        this.dispatchevent("customEventFromMessageClass", "stop");
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
      case "identify":
        this.dispatchevent(
          "customEventFromMessageClass",
          "IdentifyOrAnonymousForms",
          ""
        );
        break;
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

  dispatchevent(typeOfEvent: string, message?: string, text?: string) {
    const event: Event = new CustomEvent(typeOfEvent, {
      detail: { message, text },
      bubbles: true
    });
    this.htmlElement.dispatchEvent(event);
  }
}
