import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AddParticipantesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds: string[];
}
