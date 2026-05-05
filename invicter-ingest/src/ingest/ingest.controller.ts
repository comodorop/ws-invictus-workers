import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestExcelService } from './ingest-excel.service';
import { IngestService } from './ingest.service';
import {
  CreateMovementDto,
  MovementFilterDto,
  StatsFilterDto,
} from './dto/movement.dto';

@Controller('company/:id/movement')
export class IngestController {
  constructor(
    private readonly ingestExcelService: IngestExcelService,
    private readonly ingestService: IngestService,
  ) {}

  @Post('/excel')
  @UseInterceptors(FileInterceptor('file')) // El campo en el FormData debe llamarse 'file'
  async upload(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    try {
      if (!file) {
        throw new Error('Archivo Excel no encontrado en la petición');
      }

      const user = req.user;

      return await this.ingestExcelService.orchestrateIngestion(file, user, id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/') // Para ERPs
  async fromApi(
    @Param('id') id: string,
    @Body() data: CreateMovementDto[],
    @Req() req: any,
  ) {
    const user = (req as any).user;

    return await this.ingestService.createDirectEntry(
      data,
      'API',
      user.uuidUser,
      id,
    );
  }

  @Post('/form') // Registro manual
  async fromForm(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return await this.ingestService.createDirectEntry(
      data,
      'FORM',
      req.user,
      id,
    );
  }

  @Get('/')
  async getMovements(
    @Param('id') id: string,
    @Query() filters: MovementFilterDto,
  ) {
    return await this.ingestService.getMovements(filters, id);
  }

  @Delete('/:uuid')
  async deleteMovement(@Param('uuid') uuid: string) {
    return await this.ingestService.removeEntry(uuid);
  }

  @Get('/stats')
  async getStats(@Param('id') id: string, @Query() filters: StatsFilterDto) {
    return await this.ingestService.getDashboard(filters, id);
  }
}
