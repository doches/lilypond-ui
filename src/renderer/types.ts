export interface IMessage {
  line: string,
  number: number,
  character: number,
  type: string,
  message: string,
};

export interface ILinePosition {
  line: number;
  ch: number;
}
