import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { PasswordResetService } from '@paris-2024/server-business-logic-password-reset';
import { PasswordReset, PasswordResetBody, PasswordResetDto } from '@paris-2024/server-data-access-password-reset';

@ApiTags('password-reset')
@ApiInternalServerErrorResponse()
@Controller('password-reset')
export class PasswordResetController {
  constructor(
    private passwordResetService: PasswordResetService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: PasswordReset,
    description: 'Send password reset token',
  })
  @ApiBody({
    type: PasswordResetDto,
    description: 'email to send token to',
  })
  @ApiBadRequestResponse()
  async sendToken(@Body('email') email: PasswordReset['email']) {
    await this.passwordResetService.sendLink(email);
    return { msg: 'Reset link sent to your email.' };
  }

  @Post(':id')
  @ApiBody({
    type: PasswordResetBody,
    description: 'updated password',
  })
  async resetPassword(@Param('id') id: PasswordReset['id'], @Body() body: PasswordResetBody) {
    await this.passwordResetService.reset(id, body.password);
    return { msg: 'Password successfully updated' };
  }
}
