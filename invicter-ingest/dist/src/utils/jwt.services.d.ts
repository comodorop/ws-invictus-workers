export declare class JWTService {
    private jwtService;
    generateToken(user: any): Promise<string>;
    validateToken(token: string): Promise<any>;
}
