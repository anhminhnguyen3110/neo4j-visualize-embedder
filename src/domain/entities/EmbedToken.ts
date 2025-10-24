export class EmbedToken {
  constructor(
    public id: string,
    public embedToken: string,
    public cypherQuery: string,
    public expiresAt: Date,
    public createdAt: Date
  ) {}

  /**
   * Check if token is expired
   */
  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if token is valid (not expired)
   */
  public isValid(): boolean {
    return !this.isExpired();
  }
}

