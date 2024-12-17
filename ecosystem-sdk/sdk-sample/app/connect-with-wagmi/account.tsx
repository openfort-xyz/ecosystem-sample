import { useAccount, useDisconnect, useEnsName } from 'wagmi';

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <button
        onClick={() => disconnect()}
        type='button'
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-6 disabled:opacity-50 transition duration-300"
      >
        {'Ecosystem Logout'}
      </button>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              Item
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 border-t">
              <span className="font-semibold">Connected Account</span>
            </td>
            <td className="px-4 py-3 border-t">
              <span id="accountStatus">
                {address ? (
                  <span className="font-mono">
                    {ensName ?? address}
                  </span>
                ) : (
                  '(not connected)'
                )}
              </span>
            </td>
          </tr>
          {ensName && (
            <tr>
              <td className="px-4 py-3 border-t">
                <span className="font-semibold">ENS Name</span>
              </td>
              <td className="px-4 py-3 border-t">
                <span className="font-mono">{ensName}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}