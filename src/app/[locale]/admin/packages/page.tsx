"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "@/lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from '@/lib/utils';
import UserPackagesData from "@/src/app/[locale]/components/admin/packages/UserPackagesData";
import PackagesData from "@/src/app/[locale]/components/admin/packages/PackagesData";
import { fdatasync } from "fs";

export default async function SettingsPage(): Promise<JSX.Element> {
    await loginIsRequiredServer();

    
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const user = await find_user({ email: userEmail });
    
    const isAdmin = user?.isAdmin || false;

    return (
        isAdmin ? <div className="mt-5 flex flex-col items-center gap-5">
            <PackagesData />
            <UserPackagesData />
        </div> : <div>You are not authorized to access this page</div>
    );
};
