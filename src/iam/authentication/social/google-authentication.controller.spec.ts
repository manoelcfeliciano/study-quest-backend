import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthenticationController } from './google-authentication.controller';
import { GoogleAuthenticationService } from './google-authentication.service';
import { createMock } from '@golevelup/ts-jest';
import { SocialSignInDto } from '../dto/social-sign-in.dto';

describe('GoogleAuthenticationController', () => {
  let sut: GoogleAuthenticationController;
  let googleAuthencationService: GoogleAuthenticationService;

  beforeEach(async () => {
    googleAuthencationService = createMock<GoogleAuthenticationService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleAuthenticationController],
      providers: [
        {
          provide: GoogleAuthenticationService,
          useValue: googleAuthencationService,
        },
      ],
    }).compile();

    sut = module.get<GoogleAuthenticationController>(
      GoogleAuthenticationController,
    );
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should call googleAuthencationService.authenticate with the correct params', async () => {
    const authenticateSpy = jest.spyOn(
      googleAuthencationService,
      'authenticate',
    );

    const socialSignInDto: SocialSignInDto = {
      accessToken: 'any_access_token',
    };

    await sut.authenticate(socialSignInDto);

    expect(authenticateSpy).toHaveBeenCalledWith(socialSignInDto.accessToken);
  });

  it('should return the correct response', async () => {
    jest.spyOn(googleAuthencationService, 'authenticate').mockResolvedValue({
      accessToken: 'any_access_token',
      refreshToken: 'any_refresh_token',
    });

    const socialSignInDto: SocialSignInDto = {
      accessToken: 'any_access_token',
    };

    const response = await sut.authenticate(socialSignInDto);

    expect(response).toStrictEqual({
      accessToken: 'any_access_token',
      refreshToken: 'any_refresh_token',
    });
  });
});
