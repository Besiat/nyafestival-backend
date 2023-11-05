import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Config } from "../entity/website/config.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ConfigService {
    constructor(@InjectRepository(Config) private readonly configRepository: Repository<Config>) { }

    async getConfigValue(key: string): Promise<string | null> {
        const config = await this.configRepository.findOne({ where: { key } });
        return config?.value;
    }


    async getAllConfigs(): Promise<Config[]> {
        const result = await this.configRepository.find();
        return result;
    }

    async setConfigValue(key: string, value: string): Promise<void> {
        let config = await this.configRepository.findOne({ where: { key } });
        if (!config) {
            config = this.configRepository.create({ key, value });
        }
        else {
            config.value = value;
        }
        await this.configRepository.save(config);
    }
}