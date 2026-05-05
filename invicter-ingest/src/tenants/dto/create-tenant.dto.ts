import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  /**
   * Subdominio único para host-based routing.
   * Si no se envía, se genera automáticamente desde el nombre.
   * Ejemplo: "acme" → acme.tuapp.com
   */
  @IsOptional()
  @IsString()
  @MaxLength(63) // Límite de segmento DNS
  subdomain?: string;

  @IsOptional()
  @IsEnum(['free', 'pro'])
  plan?: 'free' | 'pro';

  // ── BYODB: credenciales de la DB propia del cliente ───────────────────────
  // Si se envía db_host, entonces db_name, db_user y db_password son requeridos.

  @IsOptional()
  @IsString()
  db_host?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  db_port?: number;

  @ValidateIf((o: CreateTenantDto) => !!o.db_host)
  @IsString()
  @IsNotEmpty()
  db_name?: string;

  @ValidateIf((o: CreateTenantDto) => !!o.db_host)
  @IsString()
  @IsNotEmpty()
  db_user?: string;

  @ValidateIf((o: CreateTenantDto) => !!o.db_host)
  @IsString()
  @IsNotEmpty()
  db_password?: string;

  /**
   * Schema dentro de la DB del cliente.
   * Default: "public" (la raíz de cualquier Postgres).
   * Útil si el cliente quiere aislar nuestras tablas en un schema propio.
   */
  @IsOptional()
  @IsString()
  @MaxLength(63)
  db_schema?: string;
}
