export class GiverResponse {
  reply?: replyGiversOrReceivers;
  constructor(
    reply?: replyGiversOrReceivers
  ) {
      (this.reply = reply);
  }
}

export class replyGiversOrReceivers {
  message: string;
  direction: string;
  button: string;
  extraInfo: string;
  constructor(
    message?: string,
    direction?: string,
    button?: string,
    extraInfo?: string
  ) {
    (this.message = message),
      (this.direction = direction),
      (this.button = button),
      (this.extraInfo = extraInfo);
  }
}

export class ReceiversResponse {
  person: string
  nextStage?: string;
  messageForUserToDisplayInResponseToPreviousStage?: replyGiversOrReceivers;
  constructor(
    person: string,
    nextStage?: string,
    messageForUserToDisplayInResponseToPreviousStage?: replyGiversOrReceivers
  ) {
    this.person = person
    this.nextStage = nextStage;
    this.messageForUserToDisplayInResponseToPreviousStage = messageForUserToDisplayInResponseToPreviousStage;
    // console.log(this.nextStage);
    // console.log(this.nextStage)
  }
}
