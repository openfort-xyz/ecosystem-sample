import * as React from "react";
import { useAccount, useBlockNumber, useChainId, useConfig } from "wagmi";
import { ExternalLink, PersonStanding } from "lucide-react";
import { Button, useOpenfort } from "@openfort/ecosystem-js/react";
import { cx } from "class-variance-authority";
import { Address, Value } from 'ox'

import { useAddressTransfers } from "../../hooks/useBlockscoutApi";
import { useSwapAssets } from "../../hooks/useSwapAssets";
import { useErc20Info } from '../../hooks/useTokenInfo'
import { config } from "../../lib/Wagmi";
import { sum, ValueFormatter, DateFormatter, StringFormatter } from "../../utils";
import { ShowMore } from "./ShowMore";
import { TruncatedAddress } from "./TruncatedAddress";
import { LogoMark } from "./LogoMark";

export function Dashboard() {
  const { logout } = useOpenfort();
  const account = useAccount();
  const chainId = useChainId();
  const { chains } = useConfig();
  const getExplorer = (chainId?: number) => {
    const chain = chains.find((c) => c.id === chainId);
    if (!chain) return undefined;
    return chain.blockExplorers?.default?.url;
  };
  const { data: transfers } = useAddressTransfers({
    chainIds: [chainId],
  });
  const { data: assets, refetch: refetchSwapAssets } = useSwapAssets({
    chainId: chainId,
  });
  const { data: blockNumber } = useBlockNumber({
    watch: { enabled: account.status === "connected", pollingInterval: 800 },
  });

  React.useEffect(() => {
    refetchSwapAssets();
  }, [blockNumber]);

  const [selectedChains, _setSelectedChains] = React.useState(
    config.chains.map((c) => c.id.toString())
  );

  const filteredTransfers = React.useMemo(() => {
    return transfers
      ?.filter((c) =>
        selectedChains.some((cc) => cc === c?.chainId?.toString())
      )
      .flatMap((chainTransfer) =>
        chainTransfer?.items.map((item) => ({
          chainId: chainTransfer.chainId,
          ...item,
        }))
      );
  }, [transfers, selectedChains]);

  const totalBalance = React.useMemo(() => {
    if (!assets) return BigInt(0);
    return sum(
      assets.map(
        (asset) =>
          Number(Value.format(asset.balance, asset.decimals)) * asset.price
      )
    );
  }, [assets]);
  
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="flex flex-1 flex-col w-full px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex justify-between items-center">
            <div className="min-lg:opacity-0">
              <LogoMark />
            </div>
          </div>
          <div className="h-8" />
          <div className="flex max-h-[100px] w-full">
            <div className="flex flex-1 flex-col justify-between">
              <div className="font-[500] text-[13px] text-gray-400">
                Your account
              </div>
              <div>
                <div className="font-[500] text-[24px] tracking-[-2.8%]">
                  ${ValueFormatter.formatToPrice(totalBalance)}
                </div>
              </div>
            </div>
          </div>
          <div className="h-6" />
          <hr className="border-gray-200" />
          <div className="h-4" />
        <details
            className="group tabular-nums"
            open={filteredTransfers?.length > 0}
        >
            <summary className='relative cursor-default list-none pr-1 font-semibold text-lg after:absolute after:right-1 after:font-normal after:text-gray-400 after:text-sm after:content-["[+]"] group-open:after:content-["[–]"]'>
            History
            </summary>

            <PaginatedTable
            columns={[
                { header: 'Time', key: 'time' },
                { header: 'Account', key: 'recipient' },
                { align: 'right', header: 'Amount', key: 'amount' },
            ]}
            data={filteredTransfers}
            emptyMessage="No transactions yet"
            renderRow={(transfer) => {
                const amount = Number.parseFloat(
                ValueFormatter.format(
                    BigInt(transfer?.total.value ?? 0),
                    Number(transfer?.total.decimals ?? 0),
                ),
                ).toFixed(2)

                return (
                <tr
                    className="text-xs sm:text-sm"
                    key={`${transfer?.transaction_hash}-${transfer?.block_number}`}
                >
                    <td className="py-1 text-left">
                    <a
                        className="flex flex-row items-center"
                        href={`${getExplorer(transfer?.chainId)}/tx/${transfer?.transaction_hash}`}
                        rel="noreferrer"
                        target="_blank"
                    >
                        <ExternalLink className="mr-1 size-4 text-gray-400" />
                        <span className="min-w-[50px] text-gray-500 sm:min-w-[65px]">
                        {DateFormatter.ago(new Date(transfer?.timestamp ?? ''))}{' '}
                        ago
                        </span>
                    </a>
                    </td>
                    <td className="flex min-w-full items-center py-1 text-left font-medium">
                    <div className="my-0.5 flex flex-row items-center gap-x-2 rounded-full bg-gray-300 p-0.5">
                        <PersonStanding className="size-4 rounded-full text-gray-400" />
                    </div>
                    <TruncatedAddress
                        address={transfer?.to.hash ?? ''}
                        className="ml-2"
                    />
                    </td>
                    <td className="py-1 text-right text-gray-400">
                    <span className="text-md">{amount}</span>
                    <div className="inline-block w-[65px]">
                        <span className="rounded-2xl bg-gray-300 px-2 py-1 font-[500] text-gray-400 text-xs">
                        <TokenSymbol
                            address={transfer?.token.address as Address.Address}
                            display="symbol"
                        />
                        </span>
                    </div>
                    </td>
                </tr>
                )
            }}
            showMoreText="more transactions"
            />
        </details>
        <div className="h-6" />
          <hr className="border-gray-200" />
          <div className="h-4" />

      <details className="group" open={assets && assets?.length > 0}>
        <summary className='relative cursor-default list-none pr-1 font-semibold text-lg after:absolute after:right-1 after:font-normal after:text-gray-400 after:text-sm after:content-["[+]"] group-open:after:content-["[–]"]'>
          <span>Assets</span>

        </summary>

        <PaginatedTable
          columns={[
            { header: 'Name', key: 'name', width: 'w-[40%]' },
            { align: 'right', header: '', key: 'balance', width: 'w-[20%]' },
            { align: 'right', header: '', key: 'symbol', width: 'w-[20%]' },
            { align: 'right', header: '', key: 'action', width: 'w-[20%]' },
            { align: 'right', header: '', key: 'action', width: 'w-[20%]' },
          ]}
          data={assets}
          emptyMessage="No balances available for this account"
          renderRow={(asset) => (
            <AssetRow
              address={asset.address}
              decimals={asset.decimals}
              key={asset.address}
              logo={asset.logo}
              name={asset.name}
              price={asset.price}
              symbol={asset.symbol}
              value={asset.balance}
            />
          )}
          showMoreText="more assets"
        />
      </details>
      <div className="h-6" />
      <hr className="border-gray-200" />
      <div className="h-4" />
          <div className="flex gap-2">
            <Button>
              <a href="https://t.me/openfort" rel="noreferrer" target="_blank">
                Help
              </a>
            </Button>
            <Button 
              onClick={async() => {
                await logout()
                window.location.reload()

              }} 
              variant="primary">
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginatedTable<T>({
  data,
  emptyMessage,
  columns,
  renderRow,
  showMoreText,
  initialCount = 5,
}: {
  data: ReadonlyArray<T> | undefined;
  emptyMessage: string;
  columns: {
    header: string;
    key: string;
    align?: "left" | "right" | "center";
    width?: string;
  }[];
  renderRow: (item: T) => React.ReactNode;
  showMoreText: string;
  initialCount?: number;
}) {
  const [firstItems, remainingItems] = React.useMemo(
    () =>
      !data
        ? [[], []]
        : [data.slice(0, initialCount), data.slice(initialCount)],
    [data, initialCount]
  );

  const [showAll, setShowAll] = React.useState<"ALL" | "DEFAULT">("DEFAULT");
  const itemsToShow = showAll === "ALL" ? data : firstItems;

  return (
    <>
      <table className="my-3 w-full table-auto">
        <thead>
          <tr className="text-gray-400 *:font-normal *:text-sm">
            {columns.map((col, index) => (
              <th
                className={cx(
                  col.width,
                  col.align === "right" ? "text-right" : "text-left"
                )}
                key={`${col.key}-${index}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="border-transparent border-t-400">
          {itemsToShow && itemsToShow?.length > 0 ? (
            itemsToShow?.map((item, index) => (
              <React.Fragment key={index}>{renderRow(item)}</React.Fragment>
            ))
          ) : (
            <tr>
              <td className="text-center text-gray-300" colSpan={columns.length}>
                <p className="mt-2 text-sm">{emptyMessage}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {remainingItems.length > 0 && (
        <div className="flex justify-start">
          <ShowMore
            className="cursor-default font-medium text-gray-400 text-sm"
            onChange={() => setShowAll(showAll === "ALL" ? "DEFAULT" : "ALL")}
            text={`Show ${remainingItems.length} ${showMoreText}`}
          />
        </div>
      )}
    </>
  );
}

function TokenSymbol({
    address,
    display,
  }: {
    address?: Address.Address | undefined
    display?: 'symbol' | 'name' | 'address'
  }) {
    const { data: tokenInfo } = useErc20Info(address)
  
    if (!address) return null
  
    if (!tokenInfo?.symbol || display === 'address')
      return StringFormatter.truncate(address, { end: 4, start: 4 })
  
    return display === 'name' ? tokenInfo.name : tokenInfo.symbol
  }

function AssetRow({
  address,
  decimals,
  logo,
  name,
  symbol,
  value,
  price,
}: {
  address: Address.Address
  decimals: number
  logo: string
  name: string
  symbol: string
  value: bigint
  price: number
}) {
  const formattedBalance = React.useMemo(
    () => ValueFormatter.format(value, decimals),
    [value, decimals],
  )

  return (
    <tr className="font-normal sm:text-sm">
        <>
          <td className="w-[80%]">
            <div className="flex items-center gap-x-2 py-2">
              <img alt="asset icon" className="size-5 sm:size-6" src={logo} />
              <span className="font-medium text-sm sm:text-md">{name}</span>
            </div>
          </td>
          <td className="w-[20%] text-right text-md">{formattedBalance}</td>
          <td className="w-[20%] pl-3.5 text-right text-md">
            ${ValueFormatter.formatToPrice(price)}
          </td>
          <td className="w-[20%] pr-1.5 pl-3 text-left text-sm">
            <span className="rounded-2xl bg-gray-100 px-2 py-1 font-[500] text-gray-400 text-xs">
              {symbol}
            </span>
          </td>
          <td className="text-right text-sm">
            <div className="flex">

            </div>
          </td>
        </>
    </tr>
  )
}