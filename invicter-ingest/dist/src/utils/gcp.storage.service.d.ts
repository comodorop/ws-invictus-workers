export declare class GcpStorageService {
    private storage;
    upload(file: Express.Multer.File): Promise<string>;
    download(fileId: string): Promise<Buffer>;
}
