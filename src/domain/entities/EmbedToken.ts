export class EmbedToken {
  constructor(
    public id: string,
    public embedToken: string,
    public cypherQuery: string,
    public expiresAt: Date,
    public createdAt: Date
  ) {}

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isValid(): boolean {
    return !this.isExpired();
  }
}

