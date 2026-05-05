export declare class UtilsService {
    encryptPassword(password: string): Promise<string>;
    desencryptPassword(password: string, hash: string): Promise<boolean>;
}
