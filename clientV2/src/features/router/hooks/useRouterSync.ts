// hooks/routers/useRouterSync.ts

import { useMutation } from "@tanstack/react-query";
import { routerApi } from "@/lib/api/router";


export function useSyncAllRouters() {
    return useMutation({
        mutationFn: () => routerApi.syncAllRouters(),
    });
}