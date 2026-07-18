/** Thrown by skeleton stubs whose implementation lands in a later stage. */
export class NotImplemented extends Error {
  constructor(what: string) {
    super(`Not implemented: ${what}`);
    this.name = 'NotImplemented';
  }
}
