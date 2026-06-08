import { Injectable } from "@nestjs/common";

interface VkTokenResponse {
    access_token?: string;
    error_description?: string;
}

interface VkUserInfoResponse {
    sub?: string;
    first_name?: string;
    last_name?: string;
    picture?: string;
    error_description?: string;
}

interface VkProfile {
    uid?: string;
    first_name?: string;
    last_name?: string;
    photo?: string;
}

@Injectable()
export class VkAuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor() {
        this.clientId = process.env.VK_CLIENT_ID;
        this.clientSecret = process.env.VK_SECRET_KEY;
        this.redirectUri = process.env.VK_REDIRECT_URI;
    }

    async getAccessToken(code: string, deviceId: string): Promise<string> {
        const url = `https://id.vk.com/oauth2/auth`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                code: code,
                device_id: deviceId,
                grant_type: 'authorization_code',
            }).toString(),
        });
        const data = await response.json() as VkTokenResponse;
        if (!response.ok) {
            throw new Error(`Error fetching access token: ${data.error_description}`);
        }
        return data.access_token;
    }

    async getUserInfo(accessToken: string): Promise<VkProfile> {
        const url = `https://id.vk.com/oauth2/user_info`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        const userInfo = await response.json() as VkUserInfoResponse;
        if (!response.ok) {
            throw new Error(`Error fetching user info: ${userInfo.error_description}`);
        }
        const vkProfile  = {
            uid: userInfo.sub,
            first_name: userInfo.first_name,
            last_name: userInfo.last_name,
            photo: userInfo.picture,
        };
        return vkProfile;
    }
}
