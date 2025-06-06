import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetPayment() {
  const { user } = useAuthContext();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  let parsedBranch = storedBranch;

  if (storedBranch !== 'all') {
    try {
      parsedBranch = JSON.parse(storedBranch);
    } catch (error) {
      console.error('Error parsing storedBranch:', error);
    }
  }

  const branchQuery =
    parsedBranch && parsedBranch !== 'all'
      ? `branchId=${parsedBranch}`
      : '';

  const queryString = [branchQuery].filter(Boolean).join('&');

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/payment${queryString ? `?${queryString}` : ''}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      payment: data?.data || [],
      paymentLoading: isLoading,
      paymentError: error,
      paymentValidating: isValidating,
      paymentEmpty: !isLoading && !data?.data?.length,
      mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate],
  );

  return memoizedValue;
}
