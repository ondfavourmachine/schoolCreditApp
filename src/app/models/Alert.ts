

export class Alert{
    errorBool: boolean;
    errorText: string;
    class: string
    constructor(errorbool: boolean, errortext: string, classes?: string){
    this.errorBool = errorbool;
    this.errorText = errortext;
    this.class = (!classes)? null : classes
    }
}