"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useMikrotikContext() {
	const params = useSearchParams();

	return useMemo(() => {

		const decode = (value?: string | null) => {
			if (!value) return null;

			try {
				return decodeURIComponent(
					decodeURIComponent(value)
				);
			} catch {
				return value;
			}
		};


		return {
			macAddress: decode(params.get("mac")),

			ipAddress:
				params.get("ip"),

			username:
				params.get("username"),

			routerIdentity:
				params.get("identity"),

			routerHostname:
				params.get("hostname"),

			serverName:
				params.get("servername"),

			loginUrl:
				params.get("loginurl"),

			logoutUrl:
				params.get("logouturl"),

			originalUrl:
				params.get("linkorig"),

			chapId:
				params.get("chapid"),

			chapChallenge:
				params.get("chapchallenge"),
		};

	}, [params]);
}