import _NextLink from "next/link";
import { useRouter } from "next/router";
import { match } from "path-to-regexp";

import Link from "./link";

export function NextLink({ passHref = true, href, as, ...rest }) {
  const { query } = useRouter();
  return (
    <_NextLink
      passHref={passHref}
      href={{
        pathname: href.pathname || href,
        query: query.network && { network: query.network },
      }}
      as={as && as + (query.network ? `?network=${query.network}` : "")}
      {...rest}
    />
  );
}

export function NextETHLink({ address, children, ...rest }) {
  const router = useRouter();
  return (
    <Link
      newTab
      href={`https://${
        router?.query?.network ? `${router.query.network}.` : ""
      }etherscan.io/address/${address}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export const createWrapConnection = (queries, queryEnums) => {
  const matchers = Object.keys(queries).reduce((acc, key) => {
    acc[key] = match(key, { decode: decodeURIComponent });
    return acc;
  }, {});

  const parseAsPath = (asPath) => {
    let [path, query] = asPath.split("?");

    query = [...new URLSearchParams(query).entries()].reduce(
      (acc, [key, value]) => {
        const queryEnumQuery = queryEnums[key]?.[value]?.query;
        if (queryEnumQuery) acc = { ...acc, ...queryEnumQuery };
        else
          acc[key] =
            typeof value === "boolean" ||
            Number.isNaN(Number(value)) ||
            value.startsWith("0x")
              ? value
              : Number(value);
        return acc;
      },
      {}
    );

    for (const [key, matcher] of Object.entries(matchers)) {
      const _match = matcher(path);
      if (_match) {
        path = key;
        query = {
          ...query,
          ...Object.keys(_match.params).reduce((acc, _key) => {
            acc[_key] = _match.params[_key].toLowerCase
              ? _match.params[_key].toLowerCase()
              : _match.params[_key];
            return acc;
          }, {}),
        };
        break;
      }
    }

    return { path, query };
  };

  const wrapConnection = (connection) => (asPath) => {
    const { path, query } = parseAsPath(asPath);
    connection(path, query);
  };
  wrapConnection.parseAsPath = parseAsPath;
  return wrapConnection;
};
