import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetBankAccount() {
  const { user } = useAuthContext();
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/bank-account`;
  const { data, error, isValidating, mutate } = useSWR(URL, fetcher);
  if (error) {
    console.error('Error fetching data:', error);
  }
  const memoizedValue = useMemo(() => {
    const bankAccount = data?.data || [];
    const isLoading = !data && !error;
    return {
      bankAccount,
      bankAccountLoading: isLoading,
      bankAccountError: error,
      bankAccountValidating: isValidating,
      bankAccountEmpty: !isLoading && bankAccount.length === 0,
      mutate,
    };
  }, [data?.data, error, isValidating, mutate]);

  return memoizedValue;
}
