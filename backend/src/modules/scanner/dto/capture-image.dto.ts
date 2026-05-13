import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CaptureImageDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^data:image\/(png|jpeg|jpg|webp);base64,/, {
    message: 'imageData debe ser un data URL válido (png, jpeg o webp en base64)',
  })
  imageData: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  personId?: string;
}
