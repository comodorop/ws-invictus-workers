import { CreateMovementDto } from '../dto/movement.dto';
import { MovementEntity } from '../entities/movement.entity';
export declare class MovementMapper {
    dtoToEntity(dto: CreateMovementDto, sourceType: 'API' | 'FORM' | 'EXCEL', userId: string): MovementEntity;
    entityToDto(entity: any): {
        id: any;
        amount: number;
        date: any;
        isFiscal: any;
        description: any;
        accountType: any;
        currency: any;
        categoryType: any;
        companyId: any;
        accountingCode: any;
        metadata: any;
    };
}
