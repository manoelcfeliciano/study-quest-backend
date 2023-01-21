export abstract class ResponseDto {
  abstract toPlain(): any;
  abstract toInstance(partial: any): any;
}
