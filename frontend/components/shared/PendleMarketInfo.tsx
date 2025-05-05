'use client';

import { useEffect, useState } from 'react';

export function PendleMarketComponent() {
  const [impliedApy, setImpliedApy] = useState<number | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          'https://api-v2.pendle.finance/core/v1/1/markets/active'
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        
        // Find the market with name 'USDe'
        const usDeMarket = json.markets.find((market: any) => market.name === 'USDe');
        if (usDeMarket) {
          setImpliedApy(usDeMarket.details.impliedApy);
          setExpiry(usDeMarket.expiry);
        } else {
          throw new Error('USDe market not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p className="text-black">Loading...</p>;
  if (error) return <p className="text-black">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-black">Implied APY:</h2>
      <p className="text-2xl text-green-600 font-bold">
        {(impliedApy! * 100).toFixed(3)}%
      </p>
      <h3 className="text-lg font-semibold text-black mt-4">Expiry:</h3>
      <p className="text-lg text-black">{new Date(expiry!).toLocaleDateString()}</p>
    </div>
  );
}
