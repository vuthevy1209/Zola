import Realm from 'realm';
import { createRealmContext } from '@realm/react';

export class UserProfile extends Realm.Object<UserProfile> {
    id!: string;
    username!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    phone?: string;
    avatarUrl?: string;
    role!: string;
    createdAt?: string;

    static primaryKey = 'id';
}


const realmConfig: Realm.Configuration = {
    schema: [UserProfile],
    schemaVersion: 3,
};

export const { RealmProvider, useRealm, useQuery, useObject } = createRealmContext(realmConfig);
