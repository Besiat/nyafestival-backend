import { Controller, Get, UseGuards, Param, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../services/config.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Config } from '../entity/website/config.entity';
import { AdminGuard } from '../guards/admin-guard';
import { JwtAuthGuard } from '../guards/jwt-guard';

@Controller('api/configs')
@ApiTags('Configs')
export class ConfigController {
    constructor(private readonly configService: ConfigService) { }
    @Get('all')
    @ApiOperation({ operationId: 'getAllConfigs', summary: 'Get all config values' })
    @ApiResponse({ status: 200, description: 'Returns all config values', type: Config, isArray: true })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async getAllConfigs(): Promise<Config[]> {
        return this.configService.getAllConfigs();
    }

    @Get(':key')
    @ApiOperation({ operationId: 'getConfig', summary: 'Get a config value by key' })
    @ApiParam({ name: 'key', description: 'Config key' })
    @ApiResponse({ status: 200, description: 'Returns a config value by key', type: String })
    async getConfig(@Param('key') key: string): Promise<string | null> {
        return this.configService.getConfigValue(key);
    }

    @Get(':key/:value')
    @ApiOperation({ operationId: 'setConfig', summary: 'Set a config value' })
    @ApiParam({ name: 'key', description: 'Config key' })
    @ApiParam({ name: 'value', description: 'Config value' })
    @ApiResponse({ status: 200, description: 'Sets a config value', type: Config })
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    async setConfig(@Param('key') key: string, @Param('value') value: string): Promise<void> {
        if (!key || !value) {
            throw new BadRequestException('Key and value are required');
        }
        await this.configService.setConfigValue(key, value);
    }
}
