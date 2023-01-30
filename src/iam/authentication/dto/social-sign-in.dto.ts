import { IsNotEmpty } from 'class-validator';

export class SocialSignInDto {
  @IsNotEmpty()
  accessToken: string;
}
