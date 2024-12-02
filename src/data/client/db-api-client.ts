import { DatabaseContextType } from "@/contexts/db-context";
import { SaaSContextType } from "@/contexts/saas-context";
import { DatabaseAuthorizeChallengeRequestDTO, DatabaseAuthorizeRequestDTO, DatabaseCreateRequestDTO, DatabaseRefreshRequestDTO, KeyACLDTO, KeyHashParamsDTO, SaaSDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type CreateDbResponse = {
  message: string;
  data: {
    emailHash: string;
  }
  status: number;
  issues?: any[];
};
export type AuthorizeDbChallengeResponse = {
  message: string;
  data?: KeyHashParamsDTO,
  status: number;
  issues?: any[];
};

export type AuthorizeDbResponse = {
  message: string;
  data: {
    encryptedMasterKey: string;
    accessToken: string;
    refreshToken: string;
    acl: KeyACLDTO | null;
    saasContext?: SaaSDTO | null
  }
  status: number;
  issues?: any[];
};

export type RefreshDbResponse = {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  }
  status: number;
  issues?: any[];
};

export class DbApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, saasContext?: SaaSContextType, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, saasContext, encryptionConfig);
    }
  
    async create(createRequest:DatabaseCreateRequestDTO): Promise<CreateDbResponse> {
      return this.request<CreateDbResponse>('/api/db/create', 'POST', { ecnryptedFields: [] }, createRequest) as Promise<CreateDbResponse>;
    }
  
    async authorizeChallenge(authorizeChallengeRequest: DatabaseAuthorizeChallengeRequestDTO): Promise<AuthorizeDbChallengeResponse> {
       return this.request<AuthorizeDbChallengeResponse>('/api/db/challenge?emailHash=' + encodeURIComponent(authorizeChallengeRequest.emailHash), 'POST', { ecnryptedFields: [] }, authorizeChallengeRequest) as Promise<AuthorizeDbChallengeResponse>;
    }

    async authorize(authorizeRequest: DatabaseAuthorizeRequestDTO): Promise<AuthorizeDbResponse> {
      return this.request<AuthorizeDbResponse>('/api/db/authorize?emailHash=' + encodeURIComponent(authorizeRequest.emailHash), 'POST', { ecnryptedFields: [] }, authorizeRequest) as Promise<AuthorizeDbResponse>;
   }

   async refresh(refreshRequest: DatabaseRefreshRequestDTO): Promise<RefreshDbResponse> {
    return this.request<AuthorizeDbResponse>('/api/db/refresh', 'POST', { ecnryptedFields: [] }, refreshRequest) as Promise<AuthorizeDbResponse>;
 }   

  }