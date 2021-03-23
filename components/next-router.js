import _NextLink from "next/link";
import { useRouter } from "next/router";
import { match } from "path-to-regexp";

import Link from "./link";

const defaultNetwork = process.env.NEXT_PUBLIC_NETWORK;

export function NextLink({ passHref = true, href, as, ...rest }) {
  href = typeof href === "string" ? new URL(href, "http://localhost") : href;
  const hrefQuery = href.query
    ? href.query
    : Object.fromEntries(href.searchParams?.entries() ?? {});

  const { query } = useRouter();

  const networkMixin = query.network ? { network: query.network } : {};
  const finalQuery = { ...hrefQuery, ...networkMixin };
  const queryString =
    Object.keys(finalQuery).length > 0
      ? `?${new URLSearchParams(finalQuery)}`
      : "";

  return (
    <_NextLink
      passHref={passHref}
      href={{
        pathname: href.pathname || href,
        query: finalQuery,
      }}
      as={as && as + queryString}
      {...rest}
    />
  );
}

export function NextETHLink({ address, children, ...rest }) {
  const router = useRouter();

  const network = router.query?.network ?? defaultNetwork;
  const prefix = network === "mainnet" ? "" : `${network}.`;
  return (
    <Link
      newTab
      href={`https://${prefix}etherscan.io/address/${address}`}
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

    const funcQueryEnumQueries = [];
    query = [...new URLSearchParams(query).entries()].reduce(
      (acc, [key, value]) => {
        const queryEnumQuery = queryEnums[key]?.[value]?.query;
        if (typeof queryEnumQuery === "function")
          funcQueryEnumQueries.push(queryEnumQuery);
        else if (queryEnumQuery) acc = { ...acc, ...queryEnumQuery };
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
    for (const funcQueryEnumQuery of funcQueryEnumQueries)
      query = { ...query, ...funcQueryEnumQuery(query) };

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
            acc[`_${_key}`] = [acc[_key]];
            return acc;
          }, {}),
        };
        break;
      }
    }

    if (query.search) query.address = query.search;
    return { path, query };
  };

  const wrapConnection = (connection) => (asPath) => {
    const { path, query } = parseAsPath(asPath);
    connection(path, query);
  };
  wrapConnection.parseAsPath = parseAsPath;
  return wrapConnection;
};
