import { DataLoadingStatus } from '@/data/client/models';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { DatabaseContext } from './db-context';
import { toast } from 'sonner';
import { ConfigContextType } from '@/contexts/config-context';
import { TermApiClient } from '@/data/client/term-api-client';
import { TermDTO } from '@/data/dto';
import { sha256 } from '@/lib/crypto';
import { useSearchParams } from 'next/navigation';
import { GetSaaSResponseSuccess, SaasApiClient } from '@/data/client/saas-api-client';


export interface SaaSContextType {
    currentQuota: {
        allowedDatabases: number,
        allowedUSDBudget: number,
        allowedTokenBudget: number
    },
    currentUsage: {
        usedDatabases: number,
        usedUSDBudget: number,
        usedTokenBudget: number
    },
    email: string | null;
    userId: string | null;
    saasToken: string | null;
    setSaasToken: (token: string) => void;
    loadSaaSContext: (saasToken: string) => Promise<void>;
}


export const SaaSContext = createContext<SaaSContextType>({
    currentQuota: {
        allowedDatabases: 0,
        allowedUSDBudget: 0,
        allowedTokenBudget: 0
    },
    currentUsage: {
        usedDatabases: 0,
        usedUSDBudget: 0,
        usedTokenBudget: 0
    },
    email: null,
    userId: null,
    saasToken: null,
    setSaasToken: (token: string) => {},
    loadSaaSContext: async (saasToken: string) => {}
});

export const SaaSContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [saasToken, setSaasToken] = useState<string | null>(null);
    const [currentQuota, setCurrentQuota] = useState({
        allowedDatabases: 0,
        allowedUSDBudget: 0,
        allowedTokenBudget: 0
    });
    const [currentUsage, setCurrentUsage] = useState({
        usedDatabases: 0,
        usedUSDBudget: 0,
        usedTokenBudget: 0
    });
    const [email, setEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const dbContext = useContext(DatabaseContext);


    const setupApiClient = async (config: ConfigContextType | null) => {
        const client = new SaasApiClient('', dbContext);
        return client;
    }

    const loadSaaSContext = async (saasToken: string) => {
        if (!process.env.NEXT_PUBLIC_SAAS) return;
        if(saasToken || saasToken !== '') {
            if (typeof localStorage !== 'undefined')
                localStorage.setItem('saasToken', saasToken);
            setSaasToken(saasToken);
        } else {
            if (typeof localStorage !== 'undefined')
                setSaasToken(localStorage.getItem('saasToken'));
        }

        const client = await setupApiClient(null);
        const saasAccount = await client.get(saasToken && saasToken !== null ? saasToken : '', false) as GetSaaSResponseSuccess;

        if(saasAccount.status !== 200) {
//            toast.error('Failed to load SaaS account. Your account may be disabled or the token is invalid.');
        } else {
            setCurrentQuota(saasAccount.data.currentQuota);
            setCurrentUsage(saasAccount.data.currentUsage);
            setEmail(saasAccount.data.email || null);
            setUserId(saasAccount.data.userId || null);
            if(typeof localStorage !== 'undefined') {
                localStorage.setItem('saasToken', saasAccount.data.saasToken); // if the context was loaded by emailHash this is important step
            }
        }
    
    } 

    return (
        <SaaSContext.Provider value={{ 
            currentQuota,
            currentUsage,
            saasToken,
            email,
            userId,
            setSaasToken,
            loadSaaSContext
         }}>
            {children}
        </SaaSContext.Provider>
    );
};