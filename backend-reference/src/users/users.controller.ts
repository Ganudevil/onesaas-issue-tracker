import { Controller, Get, Post, Body, Query, UseGuards, Patch, Param, Headers as RequestHeaders } from '@nestjs/common';
import { UsersService } from './users.service';
import { KeycloakAuthGuard } from '../auth/keycloak.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(KeycloakAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('by-email')
    async getUserByEmail(@Query('email') email: string, @RequestHeaders('x-tenant-id') tenantId: string = 'tenant1') {
        return this.usersService.getUserByEmail(email, tenantId);
    }

    @Get()
    async getAllUsers(@RequestHeaders('x-tenant-id') tenantId: string = 'tenant1') {
        return this.usersService.getAllUsers(tenantId);
    }

    @Get(':id')
    async getUserById(@Param('id') id: string, @RequestHeaders('x-tenant-id') tenantId: string = 'tenant1') {
        return this.usersService.getUserById(id, tenantId);
    }

    @Get('debug-setup-test')
    async debugTest(@Query('tenantId') tenantId: string = 'tenant1') {
        return this.usersService.getAllUsers(tenantId);
    }

    @Post()
    async create(@Body() user: any, @RequestHeaders('x-tenant-id') tenantId: string = 'tenant1') {
        return this.usersService.create(user, tenantId);
    }

    @Patch(':email/role')
    async updateRole(@Param('email') email: string, @Body('role') role: string, @RequestHeaders('x-tenant-id') tenantId: string = 'tenant1') {
        return this.usersService.updateRole(email, role, tenantId);
    }
}
