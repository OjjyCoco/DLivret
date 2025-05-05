'use client';

import { useEffect, useState } from 'react';

export function PendleMarketComponent() {
  const [impliedApy, setImpliedApy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          'https://api-v2.pendle.finance/core/v2/1/markets/0x9df192d13d61609d1852461c4850595e1f56e714/data'
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setImpliedApy(json.impliedApy);
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-black">Implied APY:</h2>
      <p className="text-2xl text-green-600 font-bold">
        {(impliedApy! * 100).toFixed(3)}%
      </p>
    </div>
  );
}
