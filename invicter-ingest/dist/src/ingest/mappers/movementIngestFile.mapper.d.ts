import { MovementIngestFileEntity } from '../entities/movementIngestFile.entity';
import { MovementIngestFileDto } from '../dto/movementIngestFile.dto';
export declare class MovementIngestFileMapper {
    toDto(entity: MovementIngestFileEntity): MovementIngestFileDto;
    toEntity(dto: MovementIngestFileDto): MovementIngestFileEntity;
}
