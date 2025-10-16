import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabaseModule } from './modules/database/database.module';
import { TodosModule } from './modules/todos/todos.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthenticationModule,
    DatabaseModule,
    TodosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
