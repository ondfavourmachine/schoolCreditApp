export class GiverResponse {
  reply?: replyGiversOrReceivers;
  constructor(reply?: replyGiversOrReceivers) {
    this.reply = reply;
  }
}

export class replyGiversOrReceivers {
  message: string;
  direction: string;
  button: string;
  extraInfo: string;
  preventOrAllow?: 'allow' | 'prevent';
  options?: {classes: string[]}
  constructor(
    message?: string,
    direction?: string,
    button?: string,
    extraInfo?: string,
    preventOrAllow?: 'allow' | 'prevent',
    options?: {classes: string[]}
  ) {
    (this.message = message),
      (this.direction = direction),
      (this.button = button),
      (this.extraInfo = extraInfo);
    this.preventOrAllow = preventOrAllow;
    this.options = options
  }
}

export class ReceiversResponse {
  person: string;
  nextStage?: string;
  messageForUserToDisplayInResponseToPreviousStage?: replyGiversOrReceivers;
  optionalReplyToUser: replyGiversOrReceivers;
  constructor(
    person: string,
    nextStage?: string,
    messageForUserToDisplayInResponseToPreviousStage?: replyGiversOrReceivers,
    optionalReply?: replyGiversOrReceivers
  ) {
    this.person = person;
    this.nextStage = nextStage;
    this.messageForUserToDisplayInResponseToPreviousStage = messageForUserToDisplayInResponseToPreviousStage;
    this.optionalReplyToUser = optionalReply;
    // console.log(this.nextStage);
    // console.log(this.nextStage)
  }
}
