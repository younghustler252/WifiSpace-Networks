// src/modules/auth/usecases/refresh-token.usecase.js
export class RefreshToken {

    constructor({userRepository, tokenService, auditService}) {
      this.userRepository = userRepository;
      this.tokenService = tokenService;
      this.auditService = auditService;
    }

  async execute({ refreshToken }) {
    // verify refresh token
    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }

    // fetch user
    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new Error("User not found");

    // generate new tokens
    const newAccessToken = this.tokenService.generateAccessToken({ sub: user.id, role: user.role });
    const newRefreshToken = this.tokenService.generateRefreshToken({ sub: user.id });

    // optional: log audit
    if (this.auditService) {
      await this.auditService.log({
        actorId: user.id,
        action: "TOKEN_REFRESH",
        resource: "User",
        metadata: {}
      });
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}