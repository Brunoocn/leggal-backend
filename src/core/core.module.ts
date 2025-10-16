import { Global, Module } from '@nestjs/common';

import { ProvidersModule } from './providers/providers.module';
// import { SendMailSendgridService } from './services/implementations/send-mail-sendgrid/send-mail-sendgrid.service';
@Global()
@Module({
  imports: [ProvidersModule],
  exports: [ProvidersModule],
})
export class CoreModule {}
